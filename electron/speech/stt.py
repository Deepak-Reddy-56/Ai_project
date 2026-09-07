import json
import os
import sys

import numpy as np
import sounddevice as sd
from faster_whisper import WhisperModel

SAMPLE_RATE = 16_000
CHANNELS = 1
CHUNK_SECONDS = float(os.getenv('ASSISTANT_STT_CHUNK_SECONDS', '2.0'))
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

    blocksize = int(SAMPLE_RATE * CHUNK_SECONDS)

    # Blocking input capture keeps the worker simple and avoids browser or
    # Chromium microphone permissions altogether.
    with sd.RawInputStream(
        samplerate=SAMPLE_RATE,
        channels=CHANNELS,
        dtype='int16',
        blocksize=blocksize,
    ) as stream:
        emit({'type': 'listening'})

        while True:
            raw, overflowed = stream.read(blocksize)
            if overflowed:
                emit({'type': 'audio-status', 'message': 'Input buffer overflow; recovering.'})

            samples = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
            rms = float(np.sqrt(np.mean(np.square(samples))) + 1e-12)
            emit({'type': 'audio-level', 'level': round(rms, 4)})

            if rms < MIN_RMS:
                continue

            segments, _ = model.transcribe(
                samples,
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


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        emit({'type': 'end'})
    except Exception as exc:
        emit({'type': 'error', 'message': str(exc)})
        sys.exit(1)
