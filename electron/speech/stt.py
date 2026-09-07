import json
import os
import sys

import numpy as np
import sounddevice as sd
from faster_whisper import WhisperModel

TARGET_SAMPLE_RATE = 16_000
CHANNELS = 1
BLOCK_SECONDS = float(os.getenv('ASSISTANT_STT_BLOCK_SECONDS', '0.5'))
WINDOW_SECONDS = float(os.getenv('ASSISTANT_STT_WINDOW_SECONDS', '3.0'))
MIN_RMS = float(os.getenv('ASSISTANT_STT_MIN_RMS', '0.008'))
MODEL_NAME = os.getenv('ASSISTANT_WHISPER_MODEL', 'base.en')
DEVICE = os.getenv('ASSISTANT_WHISPER_DEVICE', 'cpu')
COMPUTE_TYPE = os.getenv('ASSISTANT_WHISPER_COMPUTE_TYPE', 'int8')
LANGUAGE = os.getenv('ASSISTANT_WHISPER_LANGUAGE', 'en')


def emit(payload):
    sys.stdout.write(json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + '\n')
    sys.stdout.flush()


def resample_audio(samples, source_rate, target_rate):
    if source_rate == target_rate or samples.size == 0:
        return samples.astype(np.float32, copy=False)
    target_length = max(1, int(round(samples.size * target_rate / source_rate)))
    source_positions = np.arange(samples.size, dtype=np.float32)
    target_positions = np.linspace(0, samples.size - 1, target_length, dtype=np.float32)
    return np.interp(target_positions, source_positions, samples).astype(np.float32)


def main():
    emit({
        'type': 'status',
        'state': 'loading-model',
        'model': MODEL_NAME,
        'device': DEVICE,
        'compute_type': COMPUTE_TYPE,
    })

    model = WhisperModel(MODEL_NAME, device=DEVICE, compute_type=COMPUTE_TYPE)

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
        })
    except Exception as exc:
        emit({'type': 'error', 'message': f'Could not access the default microphone: {exc}'})
        return 1

    blocksize = max(1, int(source_rate * BLOCK_SECONDS))
    window_size = max(1, int(TARGET_SAMPLE_RATE * WINDOW_SECONDS))
    audio_buffer = np.zeros((0,), dtype=np.float32)

    emit({'type': 'ready', 'engine': 'faster-whisper', 'model': MODEL_NAME})

    try:
        with sd.InputStream(
            device=device_index,
            samplerate=source_rate,
            channels=CHANNELS,
            dtype='float32',
            blocksize=blocksize,
            latency='high',
        ) as stream:
            emit({'type': 'listening'})

            while True:
                samples, overflowed = stream.read(blocksize)
                samples = np.asarray(samples[:, 0], dtype=np.float32)
                if overflowed:
                    emit({'type': 'audio-status', 'message': 'Input buffer overflow; recovering.'})

                target_samples = resample_audio(samples, source_rate, TARGET_SAMPLE_RATE)
                rms = float(np.sqrt(np.mean(np.square(target_samples))) + 1e-12)
                emit({'type': 'audio-level', 'level': round(rms, 4)})

                audio_buffer = np.concatenate((audio_buffer, target_samples))
                if audio_buffer.size < window_size:
                    continue

                window = audio_buffer[-window_size:]
                window_rms = float(np.sqrt(np.mean(np.square(window))) + 1e-12)
                if window_rms >= MIN_RMS:
                    segments, _ = model.transcribe(
                        window,
                        language=LANGUAGE,
                        beam_size=5,
                        temperature=0.0,
                        vad_filter=True,
                        condition_on_previous_text=False,
                        without_timestamps=True,
                    )
                    text = ' '.join(segment.text.strip() for segment in segments).strip()
                    if text:
                        emit({'type': 'recognized', 'text': text})

                audio_buffer = audio_buffer[-int(TARGET_SAMPLE_RATE * 0.75):]

    except KeyboardInterrupt:
        return 0
    except Exception as exc:
        emit({'type': 'error', 'message': f'Microphone/STT worker failed: {exc}'})
        return 1
    finally:
        emit({'type': 'end'})


if __name__ == '__main__':
    raise SystemExit(main())
