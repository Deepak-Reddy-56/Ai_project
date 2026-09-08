import argparse
import sys
import wave

import numpy as np

from stt import (
    FRAME_SAMPLES,
    LANGUAGE,
    MIN_SPEECH_RMS,
    MODEL_NAME,
    TARGET_SAMPLE_RATE,
    WAKE_FALLBACK_TERMS,
    WAKE_THRESHOLD,
    WAKE_TRIGGER_FRAMES,
    WAKE_MODEL,
    ensure_truststore,
    ensure_wake_models,
    rms,
    resample_audio,
    transcribe_short_window,
)


def read_wav(path):
    with wave.open(path, 'rb') as wav:
        channels = wav.getnchannels()
        sample_width = wav.getsampwidth()
        source_rate = wav.getframerate()
        frames = wav.readframes(wav.getnframes())

    if sample_width == 2:
        audio = np.frombuffer(frames, dtype='<i2').astype(np.float32) / 32768.0
    elif sample_width == 1:
        audio = (np.frombuffer(frames, dtype=np.uint8).astype(np.float32) - 128.0) / 128.0
    elif sample_width == 4:
        audio = np.frombuffer(frames, dtype='<i4').astype(np.float32) / 2147483648.0
    else:
        raise RuntimeError(f'Unsupported WAV sample width: {sample_width} bytes')

    if channels > 1:
        audio = audio.reshape(-1, channels).mean(axis=1)

    return resample_audio(audio, source_rate), source_rate, channels


def main():
    parser = argparse.ArgumentParser(description='Feed a WAV file through the voice wake + Whisper pipeline without a microphone.')
    parser.add_argument('--audio-file', required=True)
    args = parser.parse_args()

    ensure_truststore()
    print(f'[VoiceTest] Audio: {args.audio_file}')
    audio, source_rate, channels = read_wav(args.audio_file)
    print(f'[VoiceTest] Input: {source_rate} Hz, {channels} channel(s) -> {TARGET_SAMPLE_RATE} Hz mono')
    print(f'[VoiceTest] Duration: {audio.size / TARGET_SAMPLE_RATE:.2f}s | RMS: {rms(audio):.4f}')

    print(f'[VoiceTest] Loading wake model: {WAKE_MODEL}')
    ensure_wake_models()
    from openwakeword.model import Model as WakeWordModel
    wake = WakeWordModel(
        wakeword_models=[WAKE_MODEL],
        inference_framework='onnx',
        vad_threshold=0.0,
    )

    print(f'[VoiceTest] Loading Whisper model: {MODEL_NAME}')
    from faster_whisper import WhisperModel
    whisper = WhisperModel(
        MODEL_NAME,
        device='cpu',
        compute_type='int8',
    )

    wake_hits = 0
    peak_score = 0.0
    wake_index = None
    for offset in range(0, audio.size, FRAME_SAMPLES):
        frame = audio[offset:offset + FRAME_SAMPLES]
        if frame.size < FRAME_SAMPLES:
            frame = np.pad(frame, (0, FRAME_SAMPLES - frame.size))
        prediction = wake.predict((frame * 32767).astype(np.int16))
        score = float(prediction.get(WAKE_MODEL, max((float(v) for v in prediction.values()), default=0.0)))
        peak_score = max(peak_score, score)
        if score >= WAKE_THRESHOLD:
            wake_hits += 1
        else:
            wake_hits = max(0, wake_hits - 1)
        if wake_hits >= WAKE_TRIGGER_FRAMES:
            wake_index = offset
            break

    print(f'[VoiceTest] Wake peak score: {peak_score:.3f} (threshold={WAKE_THRESHOLD})')

    transcript = transcribe_short_window(whisper, audio)
    print(f'[VoiceTest] Whisper transcript: {transcript or "<none>"}')

    wake_by_whisper = any(term in transcript.lower() for term in WAKE_FALLBACK_TERMS)
    wake_ok = wake_index is not None or wake_by_whisper

    if wake_index is not None:
        print(f'[VoiceTest] WAKE DETECTED by openWakeWord at {wake_index / TARGET_SAMPLE_RATE:.2f}s')
    elif wake_by_whisper:
        print('[VoiceTest] WAKE DETECTED by Whisper fallback')
    else:
        print('[VoiceTest] Wake word was not detected.')

    if rms(audio) < MIN_SPEECH_RMS:
        print('[VoiceTest] RESULT: FAIL (audio is effectively silent)')
        return 1
    if not transcript:
        print('[VoiceTest] RESULT: FAIL (Whisper returned no transcript)')
        return 1
    if not wake_ok:
        print('[VoiceTest] RESULT: PARTIAL (audio + Whisper work, wake detection did not trigger)')
        return 2

    print('[VoiceTest] RESULT: PASS - wake/Whisper voice pipeline is functioning without a microphone.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
