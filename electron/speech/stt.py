import json
import os
import queue
import sys
import threading
import time

import numpy as np
import sounddevice as sd
from faster_whisper import WhisperModel

SAMPLE_RATE = 16_000
CHANNELS = 1
BLOCK_SECONDS = float(os.getenv('ASSISTANT_STT_BLOCK_SECONDS', '0.5'))
WINDOW_SECONDS = float(os.getenv('ASSISTANT_STT_WINDOW_SECONDS', '3.0'))
MODEL_NAME = os.getenv('ASSISTANT_WHISPER_MODEL', 'base.en')
DEVICE = os.getenv('ASSISTANT_WHISPER_DEVICE', 'cpu')
COMPUTE_TYPE = os.getenv('ASSISTANT_WHISPER_COMPUTE_TYPE', 'int8')
LANGUAGE = os.getenv('ASSISTANT_WHISPER_LANGUAGE', 'en')
MIN_RMS = float(os.getenv('ASSISTANT_STT_MIN_RMS', '0.008'))


def emit(payload):
    sys.stdout.write(json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + '\n')
    sys.stdout.flush()


def main():
    emit({
        'type': 'status',
        'state': 'loading-model',
        'model': MODEL_NAME,
        'device': DEVICE,
        'compute_type': COMPUTE_TYPE,
    })

    model = WhisperModel(MODEL_NAME, device=DEVICE, compute_type=COMPUTE_TYPE)
    emit({'type': 'ready', 'engine': 'faster-whisper', 'model': MODEL_NAME})

    # Report the active Windows input device before opening the stream. This
    # makes standalone microphone testing much easier to diagnose.
    try:
        default_input = sd.default.device[0]
        if default_input is None or int(default_input) < 0:
            raise RuntimeError('No default input device is configured in Windows.')
        device_info = sd.query_devices(int(default_input), 'input')
        emit({
            'type': 'device',
            'index': int(default_input),
            'name': str(device_info['name']),
            'sample_rate': int(round(float(device_info['default_samplerate']))),
            'channels': int(device_info['max_input_channels']),
        })
    except Exception as exc:
        emit({'type': 'error', 'message': f'Could not access the default microphone: {exc}'})
        return 1

    command_queue = queue.Queue()
    active = False

    def read_commands():
        for line in sys.stdin:
            try:
                command = json.loads(line)
                command_queue.put(command.get('command'))
            except Exception:
                continue

    stdin_is_terminal = bool(getattr(sys.stdin, 'isatty', lambda: False)())
    if not stdin_is_terminal:
        threading.Thread(target=read_commands, daemon=True).start()

    blocksize = int(SAMPLE_RATE * BLOCK_SECONDS)
    window_size = int(SAMPLE_RATE * WINDOW_SECONDS)
    audio_buffer = np.zeros((0,), dtype=np.float32)
    stream = None

    def start_capture():
        nonlocal stream, active, audio_buffer
        if active:
            return
        audio_buffer = np.zeros((0,), dtype=np.float32)
        stream = sd.RawInputStream(
            samplerate=SAMPLE_RATE,
            channels=CHANNELS,
            dtype='int16',
            blocksize=blocksize,
            latency='high',
        )
        stream.start()
        active = True
        emit({'type': 'listening'})

    def stop_capture():
        nonlocal stream, active, audio_buffer
        active = False
        audio_buffer = np.zeros((0,), dtype=np.float32)
        if stream is not None:
            try:
                stream.stop()
            finally:
                stream.close()
            stream = None
        emit({'type': 'stopped'})

    # When this script is run directly from PowerShell, start immediately so it
    # behaves like a normal microphone test. When Electron launches it, stdin is
    # not a terminal, so Electron retains explicit start/stop control.
    if stdin_is_terminal:
        try:
            start_capture()
        except Exception as exc:
            emit({'type': 'error', 'message': f'Microphone capture failed to start: {exc}'})
            return 1

    try:
        while True:
            while not stdin_is_terminal and not command_queue.empty():
                command = command_queue.get_nowait()
                try:
                    if command == 'start':
                        start_capture()
                    elif command == 'stop':
                        stop_capture()
                except Exception as exc:
                    emit({'type': 'error', 'message': f'Microphone command failed: {exc}'})

            if not active or stream is None:
                time.sleep(0.05)
                continue

            raw, overflowed = stream.read(blocksize)
            if overflowed:
                emit({'type': 'audio-status', 'message': 'Input buffer overflow; recovering.'})

            samples = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
            rms = float(np.sqrt(np.mean(np.square(samples))) + 1e-12)
            emit({'type': 'audio-level', 'level': round(rms, 4)})

            audio_buffer = np.concatenate((audio_buffer, samples))
            if audio_buffer.shape[0] < window_size:
                continue

            window = audio_buffer[-window_size:]
            window_rms = float(np.sqrt(np.mean(np.square(window))) + 1e-12)
            if window_rms < MIN_RMS:
                audio_buffer = audio_buffer[-int(SAMPLE_RATE * 0.5):]
                continue

            segments, _ = model.transcribe(
                window,
                language=LANGUAGE,
                beam_size=5,
                best_of=5,
                temperature=0.0,
                vad_filter=True,
                condition_on_previous_text=False,
                without_timestamps=True,
            )

            text = ' '.join(segment.text.strip() for segment in segments).strip()
            if text:
                emit({'type': 'recognized', 'text': text})

            # Keep a small overlap to avoid dropping words between windows.
            audio_buffer = audio_buffer[-int(SAMPLE_RATE * 0.75):]

    except KeyboardInterrupt:
        pass
    finally:
        if stream is not None:
            try:
                stream.stop()
                stream.close()
            except Exception:
                pass
        emit({'type': 'end'})


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except Exception as exc:
        emit({'type': 'error', 'message': str(exc)})
        sys.exit(1)
