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

    command_queue = queue.Queue()
    active = False

    def read_commands():
        for line in sys.stdin:
            try:
                command = json.loads(line)
                command_queue.put(command.get('command'))
            except Exception:
                continue

    threading.Thread(target=read_commands, daemon=True).start()

    blocksize = int(SAMPLE_RATE * BLOCK_SECONDS)
    window_size = int(SAMPLE_RATE * WINDOW_SECONDS)
    audio_buffer = np.zeros((0,), dtype=np.float32)
    stream = None

    try:
        while True:
            while not command_queue.empty():
                command = command_queue.get_nowait()
                if command == 'start':
                    active = True
                    audio_buffer = np.zeros((0,), dtype=np.float32)
                    if stream is None:
                        stream = sd.RawInputStream(
                            samplerate=SAMPLE_RATE,
                            channels=CHANNELS,
                            dtype='int16',
                            blocksize=blocksize,
                        )
                        stream.start()
                    emit({'type': 'listening'})
                elif command == 'stop':
                    active = False
                    audio_buffer = np.zeros((0,), dtype=np.float32)
                    if stream is not None:
                        stream.stop()
                        stream.close()
                        stream = None
                    emit({'type': 'stopped'})

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

            # Keep a small overlap to avoid dropping words at window boundaries.
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
        main()
    except Exception as exc:
        emit({'type': 'error', 'message': str(exc)})
        sys.exit(1)
