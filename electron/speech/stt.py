import json
import os
import sys
import time

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
    audio_buffer = np.zeros((0,), dtype=np.float32)

    def audio_callback(indata, frames, callback_time, status):
        if status:
            emit({'type': 'audio-status', 'message': str(status)})
        chunk = np.asarray(indata[:, 0], dtype=np.float32).copy()
        return chunk

    # RawInputStream lets us consume the default Windows input device without
    # involving browser permissions or Chromium's speech service.
    with sd.InputStream(
        samplerate=SAMPLE_RATE,
        channels=CHANNELS,
        dtype='float32',
        blocksize=blocksize,
        callback=audio_callback,
    ):
        emit({'type': 'listening'})

        # sounddevice callbacks cannot directly return arbitrary audio to Python
        # application code, so use a short blocking RawInputStream below instead.

    with sd.RawInputStream(
        samplerate=SAMPLE_RATE,
        channels=CHANNELS,
        dtype='int16',
        blocksize=blocksize,
    ) as stream:
        while True:
            raw, overflowed = stream.read(blocksize)
            if overflowed:
                emit({'type': 'audio-status', 'message': 'Input buffer overflow; recovering.'})

            samples = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
            rms = float(np.sqrt(np.mean(np.square(samples))) + 1e-12)
            emit({'type': 'audio-level', 'level': round(rms, 4)})

            if rms < MIN_RMS:
                continue

            audio_buffer = np.concatenate((audio_buffer, samples))
            if audio_buffer.shape[0] < blocksize:
                continue

            # Keep a little context across adjacent chunks so words near the
            # boundary are less likely to be lost.
            window = audio_buffer[-int(SAMPLE_RATE * (CHUNK_SECONDS + 0.75)) :]

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

            # Retain a short overlap but prevent the buffer from growing forever.
            audio_buffer = audio_buffer[-int(SAMPLE_RATE * 0.5) :]

            time.sleep(0.01)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        emit({'type': 'end'})
    except Exception as exc:
        emit({'type': 'error', 'message': str(exc)})
        sys.exit(1)
