import json
import os
import subprocess
import sys
import time
import threading
from collections import deque

# Windows-managed certificate stores are often more complete than Python's
# bundled CA file. Inject the OS trust store before importing requests.
def ensure_truststore():
    try:
        import truststore
    except ModuleNotFoundError:
        package = 'truststore>=0.10,<1'
        sys.stderr.write(f'[VoiceEngine] Missing {package}; installing automatically...\n')
        sys.stderr.flush()
        subprocess.check_call([
            sys.executable,
            '-m',
            'pip',
            'install',
            '--disable-pip-version-check',
            package,
        ])
        import truststore
    truststore.inject_into_ssl()


ensure_truststore()

import numpy as np
import sounddevice as sd
from faster_whisper import WhisperModel

try:
    from openwakeword.model import Model as WakeWordModel
    import openwakeword.utils as wake_utils
except ModuleNotFoundError:
    package = 'openwakeword==0.6.0'
    sys.stderr.write(f'[VoiceEngine] Missing {package}; installing automatically...\n')
    sys.stderr.flush()
    subprocess.check_call([
        sys.executable,
        '-m',
        'pip',
        'install',
        '--disable-pip-version-check',
        package,
    ])
    from openwakeword.model import Model as WakeWordModel
    import openwakeword.utils as wake_utils

TARGET_SAMPLE_RATE = 16_000
CHANNELS = 1
FRAME_MS = 80
FRAME_SAMPLES = int(TARGET_SAMPLE_RATE * FRAME_MS / 1000)
MODEL_NAME = os.getenv('ASSISTANT_WHISPER_MODEL', 'base.en')
DEVICE = os.getenv('ASSISTANT_WHISPER_DEVICE', 'cpu')
COMPUTE_TYPE = os.getenv('ASSISTANT_WHISPER_COMPUTE_TYPE', 'int8')
LANGUAGE = os.getenv('ASSISTANT_WHISPER_LANGUAGE', 'en')
WAKE_MODEL = os.getenv('ASSISTANT_WAKE_MODEL', 'hey_jarvis')
WAKE_THRESHOLD = float(os.getenv('ASSISTANT_WAKE_THRESHOLD', '0.35'))
WAKE_TRIGGER_FRAMES = max(1, int(os.getenv('ASSISTANT_WAKE_TRIGGER_FRAMES', '2')))
WAKE_COOLDOWN_SECONDS = float(os.getenv('ASSISTANT_WAKE_COOLDOWN_SECONDS', '2.0'))
PREROLL_SECONDS = float(os.getenv('ASSISTANT_VOICE_PREROLL_SECONDS', '1.2'))
MAX_COMMAND_SECONDS = float(os.getenv('ASSISTANT_VOICE_MAX_COMMAND_SECONDS', '45'))
END_SILENCE_SECONDS = float(os.getenv('ASSISTANT_VOICE_END_SILENCE_SECONDS', '2.0'))
MIN_COMMAND_SECONDS = float(os.getenv('ASSISTANT_VOICE_MIN_COMMAND_SECONDS', '0.6'))
MIN_SPEECH_RMS = float(os.getenv('ASSISTANT_VOICE_MIN_SPEECH_RMS', '0.008'))
SCORE_LOG_SECONDS = float(os.getenv('ASSISTANT_VOICE_SCORE_LOG_SECONDS', '1.5'))
WAKE_FALLBACK_SECONDS = float(os.getenv('ASSISTANT_WAKE_FALLBACK_SECONDS', '2.4'))
WAKE_FALLBACK_MIN_RMS = float(os.getenv('ASSISTANT_WAKE_FALLBACK_MIN_RMS', '0.018'))
WAKE_FALLBACK_COOLDOWN_SECONDS = float(os.getenv('ASSISTANT_WAKE_FALLBACK_COOLDOWN_SECONDS', '2.0'))
WAKE_FALLBACK_TERMS = ('jarvis', 'assistant')
HOTKEY_SILENCE_TIMEOUT_SECONDS = float(os.getenv('ASSISTANT_HOTKEY_SILENCE_TIMEOUT_SECONDS', '8'))

force_command_requested = False
force_command_lock = threading.Lock()


def emit(payload):
    sys.stdout.write(json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + '\n')
    sys.stdout.flush()


def log(message):
    sys.stderr.write(f'[VoiceEngine] {message}\n')
    sys.stderr.flush()


def read_control_messages():
    global force_command_requested
    for line in sys.stdin:
        try:
            payload = json.loads(line.strip())
        except Exception:
            continue
        if payload.get('type') == 'activate-command':
            with force_command_lock:
                force_command_requested = True
            log('Hotkey command activation received from Electron.')


def take_force_command_request():
    global force_command_requested
    with force_command_lock:
        requested = force_command_requested
        force_command_requested = False
        return requested


def resample_audio(samples, source_rate):
    if source_rate == TARGET_SAMPLE_RATE or samples.size == 0:
        return samples.astype(np.float32, copy=False)
    target_length = max(1, int(round(samples.size * TARGET_SAMPLE_RATE / source_rate)))
    source_positions = np.arange(samples.size, dtype=np.float32)
    target_positions = np.linspace(0, samples.size - 1, target_length, dtype=np.float32)
    return np.interp(target_positions, source_positions, samples).astype(np.float32)


def rms(samples):
    if samples.size == 0:
        return 0.0
    return float(np.sqrt(np.mean(np.square(samples))) + 1e-12)


def ensure_wake_models():
    wake_utils.download_models(model_names=[WAKE_MODEL])


def transcribe_short_window(model, audio):
    segments, _ = model.transcribe(
        audio,
        language=LANGUAGE,
        beam_size=3,
        temperature=0.0,
        vad_filter=True,
        vad_parameters={
            'min_silence_duration_ms': 500,
            'min_speech_duration_ms': 160,
        },
        condition_on_previous_text=False,
        without_timestamps=True,
    )
    return ' '.join(segment.text.strip() for segment in segments).strip().lower()


def contains_wake_fallback(text):
    normalized = ' '.join(str(text or '').lower().split())
    if not normalized:
        return False
    return any(term in normalized for term in WAKE_FALLBACK_TERMS)


def main():
    emit({'type': 'status', 'state': 'loading-wake-model', 'model': WAKE_MODEL})
    ensure_wake_models()
    wake = WakeWordModel(
        wakeword_models=[WAKE_MODEL],
        inference_framework='onnx',
        vad_threshold=0.0,
    )

    emit({
        'type': 'status',
        'state': 'loading-model',
        'model': MODEL_NAME,
        'device': DEVICE,
        'compute_type': COMPUTE_TYPE,
    })
    whisper = WhisperModel(MODEL_NAME, device=DEVICE, compute_type=COMPUTE_TYPE)

    try:
        default_input = sd.default.device[0]
        if default_input is None or int(default_input) < 0:
            raise RuntimeError('No default Windows microphone is configured.')
        device_index = int(default_input)
        device_info = sd.query_devices(device_index, 'input')
        source_rate = int(round(float(device_info['default_samplerate'])))
        max_channels = int(device_info['max_input_channels'])
        if max_channels < 1:
            raise RuntimeError('The selected microphone has no input channels.')
        emit({
            'type': 'device',
            'index': device_index,
            'name': str(device_info['name']),
            'sample_rate': source_rate,
            'channels': max_channels,
            'wake_model': WAKE_MODEL,
        })
        log(f'Microphone ready: {device_info["name"]} @ {source_rate} Hz')
    except Exception as exc:
        emit({'type': 'error', 'message': f'Could not access the default microphone: {exc}'})
        return 1

    blocksize = max(1, int(source_rate * FRAME_MS / 1000))
    preroll = deque(maxlen=max(1, int(PREROLL_SECONDS * TARGET_SAMPLE_RATE / FRAME_SAMPLES)))
    wake_fallback_buffer = deque(maxlen=max(1, int(WAKE_FALLBACK_SECONDS * TARGET_SAMPLE_RATE / FRAME_SAMPLES)))
    command_audio = []
    command_started_at = None
    last_voice_at = None
    wake_hits = 0
    last_wake_at = 0.0
    last_fallback_at = 0.0
    last_score_log = 0.0
    in_command = False
    hotkey_active = False

    control_thread = threading.Thread(target=read_control_messages, daemon=True, name='voice-control')
    control_thread.start()

    emit({
        'type': 'ready',
        'engine': 'openwakeword+faster-whisper-hybrid-hotkey',
        'wake_model': WAKE_MODEL,
        'model': MODEL_NAME,
        'command_max_seconds': MAX_COMMAND_SECONDS,
        'command_end_silence_seconds': END_SILENCE_SECONDS,
        'wake_threshold': WAKE_THRESHOLD,
        'wake_fallback': True,
        'hotkey_activation': True,
    })

    try:
        with sd.InputStream(
            device=device_index,
            samplerate=source_rate,
            channels=CHANNELS,
            dtype='float32',
            blocksize=blocksize,
            latency='high',
        ) as stream:
            emit({'type': 'listening', 'mode': 'wake'})
            log(f'Listening for wake word "{WAKE_MODEL}" (threshold={WAKE_THRESHOLD})')

            while True:
                samples, overflowed = stream.read(blocksize)
                samples = np.asarray(samples[:, 0], dtype=np.float32)
                if overflowed:
                    emit({'type': 'audio-status', 'message': 'Input buffer overflow; recovering.'})

                frame = resample_audio(samples, source_rate)
                frame_rms = rms(frame)
                if frame.size < FRAME_SAMPLES:
                    frame = np.pad(frame, (0, FRAME_SAMPLES - frame.size))
                elif frame.size > FRAME_SAMPLES:
                    frame = frame[:FRAME_SAMPLES]

                now = time.monotonic()

                if not in_command:
                    preroll.append(frame.copy())
                    wake_fallback_buffer.append(frame.copy())

                    # Alt+Space explicitly bypasses wake-word detection. Start a
                    # fresh command capture immediately when Electron requests it.
                    if take_force_command_request():
                        in_command = True
                        hotkey_active = True
                        command_started_at = now
                        last_voice_at = now if frame_rms >= MIN_SPEECH_RMS else None
                        command_audio = []
                        preroll.clear()
                        wake_fallback_buffer.clear()
                        wake_hits = 0
                        emit({'type': 'wake', 'model': 'hotkey', 'score': 1.0, 'detector': 'hotkey'})
                        emit({'type': 'listening', 'mode': 'command', 'activation': 'hotkey'})
                        log('Hotkey activation: listening for command.')
                        continue

                    prediction = wake.predict((frame * 32767).astype(np.int16))
                    score = float(prediction.get(WAKE_MODEL, max((float(v) for v in prediction.values()), default=0.0)))
                    emit({'type': 'wake-score', 'score': round(score, 3)})

                    if now - last_score_log >= SCORE_LOG_SECONDS:
                        log(f'wake={score:.3f} | mic_rms={frame_rms:.4f}')
                        last_score_log = now

                    if score >= WAKE_THRESHOLD:
                        wake_hits += 1
                    else:
                        wake_hits = max(0, wake_hits - 1)

                    detected = wake_hits >= WAKE_TRIGGER_FRAMES and now - last_wake_at >= WAKE_COOLDOWN_SECONDS
                    fallback_detected = False

                    fallback_audio_samples = len(wake_fallback_buffer) * FRAME_SAMPLES
                    fallback_ready = fallback_audio_samples >= int(WAKE_FALLBACK_SECONDS * TARGET_SAMPLE_RATE)
                    if (
                        not detected
                        and fallback_ready
                        and frame_rms >= WAKE_FALLBACK_MIN_RMS
                        and now - last_fallback_at >= WAKE_FALLBACK_COOLDOWN_SECONDS
                    ):
                        fallback_audio = np.concatenate(list(wake_fallback_buffer), axis=0)
                        fallback_rms = rms(fallback_audio)
                        if fallback_rms >= WAKE_FALLBACK_MIN_RMS:
                            last_fallback_at = now
                            fallback_text = transcribe_short_window(whisper, fallback_audio)
                            log(f'Wake fallback transcript: {fallback_text or "<none>"}')
                            fallback_detected = contains_wake_fallback(fallback_text)
                            if fallback_detected:
                                log(f'WAKE FALLBACK DETECTED: {fallback_text}')

                    if detected or fallback_detected:
                        wake_hits = 0
                        last_wake_at = now
                        in_command = True
                        hotkey_active = False
                        command_started_at = now
                        last_voice_at = now if frame_rms >= MIN_SPEECH_RMS else None
                        command_audio = list(preroll)
                        preroll.clear()
                        wake_fallback_buffer.clear()
                        emit({
                            'type': 'wake',
                            'model': WAKE_MODEL,
                            'score': round(score, 3),
                            'detector': 'openwakeword' if detected else 'whisper-fallback',
                        })
                        emit({'type': 'listening', 'mode': 'command'})
                    continue

                command_audio.append(frame.copy())
                if frame_rms >= MIN_SPEECH_RMS:
                    last_voice_at = now

                elapsed = now - (command_started_at or now)
                silence_elapsed = now - last_voice_at if last_voice_at is not None else 0.0
                enough_audio = elapsed >= MIN_COMMAND_SECONDS
                hotkey_no_speech_timeout = hotkey_active and last_voice_at is None and elapsed >= HOTKEY_SILENCE_TIMEOUT_SECONDS
                should_finish = elapsed >= MAX_COMMAND_SECONDS or hotkey_no_speech_timeout or (
                    enough_audio and last_voice_at is not None and silence_elapsed >= END_SILENCE_SECONDS
                )
                if not should_finish:
                    continue

                audio = np.concatenate(command_audio, axis=0) if command_audio else np.zeros((0,), dtype=np.float32)
                command_audio = []
                in_command = False
                command_started_at = None
                last_voice_at = None
                hotkey_active = False
                emit({'type': 'status', 'state': 'processing-command'})
                log(f'Processing command: {audio.size / TARGET_SAMPLE_RATE:.1f}s audio')

                if rms(audio) < MIN_SPEECH_RMS:
                    emit({'type': 'listening', 'mode': 'wake'})
                    continue

                try:
                    text = transcribe_short_window(whisper, audio)
                except Exception as exc:
                    emit({'type': 'error', 'message': f'Command transcription failed: {exc}'})
                    emit({'type': 'listening', 'mode': 'wake'})
                    continue

                if text:
                    log(f'RECOGNIZED: {text}')
                    emit({'type': 'recognized', 'text': text})
                else:
                    log('No speech recognized in command window.')
                emit({'type': 'listening', 'mode': 'wake'})

    except KeyboardInterrupt:
        return 0
    except Exception as exc:
        emit({'type': 'error', 'message': f'Microphone/voice worker failed: {exc}'})
        return 1
    finally:
        emit({'type': 'end'})


if __name__ == '__main__':
    raise SystemExit(main())
