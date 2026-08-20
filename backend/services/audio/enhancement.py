"""Post-processes guitar stems to make transcription more reliable.

Demucs stems are never perfect — they contain bleed from other instruments
and noise. These helpers clean the audio up before it reaches the pitch
detector. Every function falls back to returning the original stem when
its dependencies or the audio itself can't be handled, so the pipeline
keeps running with a less-polished stem instead of failing.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from core.config import settings


def refine_guitar_stem(stem_path: Path, workspace: Path) -> Path:
    """Filter a guitar stem down to a clean harmonic signal.

    Keeps only the tonal (harmonic) part of the audio, cuts everything
    outside the guitar's frequency range, and normalizes the loudness.
    The result is a stem that produces fewer false note detections.

    Returns the input path unchanged if anything goes wrong.
    """
    librosa, numpy, soundfile, scipy = _import_audio_libs()
    if librosa is None:
        return stem_path

    try:
        audio, sample_rate = librosa.load(str(stem_path), sr=None, mono=False)
    except Exception:
        return stem_path

    if sample_rate <= 0:
        return stem_path

    channels = _as_channel_list(audio)
    nyquist = sample_rate / 2.0
    highpass_hz = min(max(settings.guitar_stem_highpass_hz, 20.0), nyquist - 10.0)
    lowpass_hz = min(
        max(settings.guitar_stem_lowpass_hz, highpass_hz + 10.0), nyquist - 1.0
    )

    if lowpass_hz <= highpass_hz:
        return stem_path

    butter, sosfiltfilt = scipy.signal.butter, scipy.signal.sosfiltfilt

    harmonic_margin = max(settings.guitar_stem_harmonic_margin, 1.0)
    highpass = butter(4, highpass_hz, btype="highpass", fs=sample_rate, output="sos")
    lowpass = butter(4, lowpass_hz, btype="lowpass", fs=sample_rate, output="sos")
    refined_channels: list[Any] = []

    for channel in channels:
        try:
            harmonic, _percussive = librosa.effects.hpss(
                channel, margin=(1.0, harmonic_margin)
            )
            band_limited = sosfiltfilt(highpass, harmonic)
            refined = sosfiltfilt(lowpass, band_limited)
        except Exception:
            return stem_path

        refined = _normalize(refined, numpy)
        if refined is None:
            return stem_path
        refined_channels.append(refined.astype(numpy.float32, copy=False))

    refined_audio = _recombine_channels(refined_channels, numpy)
    refined_path = workspace / f"{stem_path.stem}_refined.wav"

    try:
        soundfile.write(str(refined_path), refined_audio, sample_rate)
    except Exception:
        return stem_path

    return refined_path


def blend_recovered_harmonics(
    primary_stem_path: Path,
    recovery_stem_path: Path,
    workspace: Path,
) -> Path:
    """Re-add harmonic detail from Demucs' ``other`` stem to the guitar stem.

    Demucs sometimes pushes part of the guitar's sound into the ``other``
    stem. This mixes a small amount of the ``other`` stem's tonal content
    back into the guitar stem so notes aren't missed during transcription.

    Returns the primary stem unchanged if anything goes wrong.
    """
    librosa, numpy, soundfile, _scipy = _import_audio_libs()
    if librosa is None:
        return primary_stem_path

    try:
        primary_audio, sample_rate = librosa.load(
            str(primary_stem_path), sr=None, mono=False
        )
        recovery_audio, recovery_sr = librosa.load(
            str(recovery_stem_path), sr=sample_rate, mono=False
        )
    except Exception:
        return primary_stem_path

    if sample_rate <= 0 or recovery_sr != sample_rate:
        return primary_stem_path

    blend = min(max(settings.guitar_stem_recovery_blend, 0.0), 0.75)
    if blend <= 0:
        return primary_stem_path

    primary_channels = _as_channel_list(primary_audio)
    recovery_channels = _as_channel_list(recovery_audio)

    channel_count = min(len(primary_channels), len(recovery_channels))
    if channel_count == 0:
        return primary_stem_path

    blended_channels: list[Any] = []
    for index in range(channel_count):
        primary_channel = primary_channels[index]
        recovery_channel = recovery_channels[index]
        limit = min(primary_channel.shape[-1], recovery_channel.shape[-1])
        primary_channel = primary_channel[:limit]
        recovery_channel = recovery_channel[:limit]

        try:
            recovered_harmonic, _ = librosa.effects.hpss(
                recovery_channel, margin=(1.0, 3.0)
            )
        except Exception:
            return primary_stem_path

        blended = primary_channel + (recovered_harmonic * blend)
        blended = _normalize(blended, numpy)
        if blended is None:
            return primary_stem_path
        blended_channels.append(blended.astype(numpy.float32, copy=False))

    blended_audio = _recombine_channels(blended_channels, numpy)
    blended_path = workspace / f"{primary_stem_path.stem}_hybrid.wav"
    try:
        soundfile.write(str(blended_path), blended_audio, sample_rate)
    except Exception:
        return primary_stem_path

    return blended_path


def create_preview_guitar_stem(guitar_stem_path: Path, workspace: Path) -> Path:
    """Create a lightweight preview version of the guitar stem for the UI.

    The preview is band-filtered and lightly smoothed so it sounds cleaner
    in a browser player, while staying true to the original stem. Used
    only for playback — never for transcription.

    Returns the input path unchanged if anything goes wrong.
    """
    librosa, numpy, soundfile, scipy = _import_audio_libs()
    if librosa is None:
        return guitar_stem_path

    try:
        audio, sample_rate = librosa.load(str(guitar_stem_path), sr=None, mono=False)
    except Exception:
        return guitar_stem_path

    if sample_rate <= 0:
        return guitar_stem_path

    butter, sosfiltfilt = scipy.signal.butter, scipy.signal.sosfiltfilt
    channels = _as_channel_list(audio)
    preview_channels: list[Any] = []
    highpass = butter(2, 45.0, btype="highpass", fs=sample_rate, output="sos")
    lowpass_cutoff = min(7000.0, (sample_rate / 2.0) - 100.0)
    lowpass = butter(2, lowpass_cutoff, btype="lowpass", fs=sample_rate, output="sos")

    for channel in channels:
        try:
            harmonic, percussive = librosa.effects.hpss(channel, margin=(1.0, 1.8))
            filtered = sosfiltfilt(highpass, channel)
            filtered = sosfiltfilt(lowpass, filtered)
        except Exception:
            return guitar_stem_path

        # Keep the raw stem dominant, only lightly smooth Demucs artifacts.
        preview = (filtered * 0.72) + (harmonic * 0.2) + (percussive * 0.08)
        noise_floor = (
            float(numpy.percentile(numpy.abs(preview), 12)) if preview.size else 0.0
        )
        if noise_floor > 0:
            mask = numpy.abs(preview) < (noise_floor * 0.7)
            preview = numpy.where(mask, preview * 0.6, preview)

        preview = _normalize(preview, numpy)
        if preview is None:
            return guitar_stem_path
        preview_channels.append(preview.astype(numpy.float32, copy=False))

    preview_audio = _recombine_channels(preview_channels, numpy)
    preview_path = workspace / f"{guitar_stem_path.stem}_preview.wav"
    try:
        soundfile.write(str(preview_path), preview_audio, sample_rate)
    except Exception:
        return guitar_stem_path

    return preview_path


def subtract_guitar_from_source(
    source_path: Path,
    guitar_stem_path: Path,
    output_path: Path,
) -> Path:
    """Write ``source - guitar`` audio so users can get the song without guitar.

    Used by the ``no_guitar`` stem mode: load both files, subtract the
    guitar samples from the original, and write the residual to
    ``output_path``.

    Raises:
        RuntimeError: if the audio can't be loaded or written.
    """
    librosa, numpy, soundfile, _scipy = _import_audio_libs()
    if librosa is None:
        raise RuntimeError("Stem separation dependencies are not installed")

    try:
        source_audio, sample_rate = librosa.load(str(source_path), sr=None, mono=False)
        guitar_audio, _ = librosa.load(
            str(guitar_stem_path), sr=sample_rate, mono=False
        )
    except Exception as exc:
        raise RuntimeError(f"Failed to load audio for no-guitar export: {exc}") from exc

    if getattr(source_audio, "ndim", 1) == 1:
        source_audio = numpy.expand_dims(source_audio, axis=0)
    if getattr(guitar_audio, "ndim", 1) == 1:
        guitar_audio = numpy.expand_dims(guitar_audio, axis=0)

    if source_audio.shape[0] != guitar_audio.shape[0]:
        if source_audio.shape[0] == 1:
            source_audio = numpy.repeat(source_audio, guitar_audio.shape[0], axis=0)
        elif guitar_audio.shape[0] == 1:
            guitar_audio = numpy.repeat(guitar_audio, source_audio.shape[0], axis=0)
        else:
            min_channels = min(source_audio.shape[0], guitar_audio.shape[0])
            source_audio = source_audio[:min_channels]
            guitar_audio = guitar_audio[:min_channels]

    min_samples = min(source_audio.shape[-1], guitar_audio.shape[-1])
    residual = source_audio[..., :min_samples] - guitar_audio[..., :min_samples]
    residual = _normalize(residual, numpy)
    if residual is None:
        raise RuntimeError("Failed to normalize no-guitar export")

    output_audio = residual[0] if residual.shape[0] == 1 else residual.T
    try:
        soundfile.write(
            str(output_path), output_audio.astype(numpy.float32, copy=False), sample_rate
        )
    except Exception as exc:
        raise RuntimeError(f"Failed to write no-guitar export: {exc}") from exc

    return output_path


# ---------------------------------------------------------------------------
# Small internal helpers shared by the functions above.
# ---------------------------------------------------------------------------


def _import_audio_libs() -> tuple[Any, Any, Any, Any]:
    """Import audio DSP libraries, returning ``None``s if unavailable.

    Returns ``(librosa, numpy, soundfile, scipy)`` — ``scipy`` provides the
    ``butter``/``sosfiltfilt`` filters used by the stem post-processing.
    """
    try:
        import librosa
        import numpy
        import scipy
        import soundfile
    except ImportError:
        return None, None, None, None
    return librosa, numpy, soundfile, scipy


def _as_channel_list(audio: Any) -> list[Any]:
    """Normalize a (possibly mono) audio array into a list of channel arrays."""
    if getattr(audio, "ndim", 1) == 1:
        return [audio]
    return [audio[index] for index in range(audio.shape[0])]


def _recombine_channels(channels: list[Any], numpy: Any) -> Any:
    """Turn a list of channel arrays back into a single audio array."""
    return channels[0] if len(channels) == 1 else numpy.vstack(channels).T


def _normalize(audio: Any, numpy: Any) -> Any | None:
    """Scale audio to peak at 0.95 (no-op on silence)."""
    peak = float(numpy.max(numpy.abs(audio))) if audio.size else 0.0
    if peak <= 0:
        return audio
    return audio / peak * 0.95
