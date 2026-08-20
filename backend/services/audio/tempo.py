"""BPM detection for transcription timing."""

from __future__ import annotations

from pathlib import Path


def detect_bpm_from_stem(stem_path: Path) -> float:
    """Detect the tempo of an audio file in beats per minute.

    Uses librosa's beat tracking. Falls back to 120 BPM when librosa is
    unavailable, the file can't be loaded, or no tempo is detected —
    the export layer can always proceed with a reasonable default.
    """
    try:
        import librosa
    except ImportError:
        return 120.0

    try:
        audio, sample_rate = librosa.load(str(stem_path), sr=None, mono=True)
        tempo, _beats = librosa.beat.beat_track(y=audio, sr=sample_rate)
        tempo_value = float(tempo)
        if tempo_value > 0:
            return tempo_value
    except Exception:
        return 120.0

    return 120.0
