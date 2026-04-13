from __future__ import annotations

import subprocess
import sys
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any

from core.config import settings


class InferenceProvider(ABC):
    @abstractmethod
    def isolate_guitar(self, source_path: Path, workspace: Path) -> Path:
        raise NotImplementedError

    @abstractmethod
    def transcribe_guitar(self, guitar_stem_path: Path) -> dict[str, Any]:
        raise NotImplementedError


class LocalInferenceProvider(InferenceProvider):
    def isolate_guitar(self, source_path: Path, workspace: Path) -> Path:
        primary_stem = _run_demucs_two_stem(
            source_path=source_path,
            workspace=workspace,
            stem_name="guitar",
            model_name=settings.demucs_model,
            run_name="guitar",
        )
        refined_primary = _refine_guitar_stem(primary_stem, workspace)

        if settings.guitar_stem_strategy != "hybrid_other":
            return refined_primary

        try:
            other_stem = _run_demucs_two_stem(
                source_path=source_path,
                workspace=workspace,
                stem_name="other",
                model_name="htdemucs",
                run_name="other_recovery",
            )
        except Exception:
            return refined_primary

        return _blend_recovered_harmonics(refined_primary, other_stem, workspace)

    def transcribe_guitar(self, guitar_stem_path: Path) -> dict[str, Any]:
        try:
            from basic_pitch import ICASSP_2022_MODEL_PATH
            from basic_pitch.inference import predict
        except ImportError as exc:
            raise RuntimeError(
                "basic-pitch is not installed in the active Python environment"
            ) from exc

        _model_output, _midi_data, note_events = predict(
            str(guitar_stem_path),
            ICASSP_2022_MODEL_PATH,
            onset_threshold=0.5,
            frame_threshold=0.3,
            minimum_note_length=58,
            minimum_frequency=80,
            maximum_frequency=1200,
            multiple_pitch_bends=False,
            melodia_trick=True,
        )

        raw_notes = [
            {
                "start_s": float(note[0]),
                "end_s": float(note[1]),
                "pitch_midi": int(note[2]),
                "amplitude": float(note[3]),
            }
            for note in note_events
        ]
        return {
            "note_events": raw_notes,
            "note_count": len(raw_notes),
        }


class ModalInferenceProvider(InferenceProvider):
    def isolate_guitar(self, source_path: Path, workspace: Path) -> Path:
        try:
            from modal_app.demucs_fn import separate_guitar_stem
        except ImportError as exc:
            raise RuntimeError(
                "Modal provider is configured but modal_app.demucs_fn is unavailable"
            ) from exc

        source_bytes = source_path.read_bytes()
        stem_bytes = separate_guitar_stem.remote(source_bytes, source_path.name)
        stem_path = workspace / "guitar.wav"
        stem_path.write_bytes(stem_bytes)
        return _refine_guitar_stem(stem_path, workspace)

    def transcribe_guitar(self, guitar_stem_path: Path) -> dict[str, Any]:
        try:
            from modal_app.basic_pitch_fn import transcribe_audio
        except ImportError as exc:
            raise RuntimeError(
                "Modal provider is configured but modal_app.basic_pitch_fn is unavailable"
            ) from exc

        result = transcribe_audio.remote(guitar_stem_path.read_bytes())
        raw_notes = result["note_events"]
        return {
            "note_events": raw_notes,
            "note_count": len(raw_notes),
        }


def get_inference_provider() -> InferenceProvider:
    provider = settings.inference_provider.lower()
    if provider == "modal":
        return ModalInferenceProvider()
    if provider == "local":
        return LocalInferenceProvider()
    raise RuntimeError(f"Unsupported inference provider: {settings.inference_provider}")


def _refine_guitar_stem(stem_path: Path, workspace: Path) -> Path:
    try:
        import librosa
        import numpy as np
        import soundfile as sf
        from scipy.signal import butter, sosfiltfilt
    except ImportError:
        return stem_path

    try:
        audio, sample_rate = librosa.load(str(stem_path), sr=None, mono=False)
    except Exception:
        return stem_path

    if sample_rate <= 0:
        return stem_path

    if getattr(audio, "ndim", 1) == 1:
        channels = [audio]
    else:
        channels = [audio[index] for index in range(audio.shape[0])]

    nyquist = sample_rate / 2.0
    highpass_hz = min(max(settings.guitar_stem_highpass_hz, 20.0), nyquist - 10.0)
    lowpass_hz = min(
        max(settings.guitar_stem_lowpass_hz, highpass_hz + 10.0), nyquist - 1.0
    )

    if lowpass_hz <= highpass_hz:
        return stem_path

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

        peak = float(np.max(np.abs(refined))) if refined.size else 0.0
        if peak > 0:
            refined = refined / peak * 0.95
        refined_channels.append(refined.astype(np.float32, copy=False))

    refined_audio = (
        refined_channels[0]
        if len(refined_channels) == 1
        else np.vstack(refined_channels).T
    )
    refined_path = workspace / f"{stem_path.stem}_refined.wav"

    try:
        sf.write(str(refined_path), refined_audio, sample_rate)
    except Exception:
        return stem_path

    return refined_path


def _run_demucs_two_stem(
    source_path: Path,
    workspace: Path,
    stem_name: str,
    model_name: str,
    run_name: str,
) -> Path:
    demucs_out = workspace / f"demucs_{run_name}"
    demucs_out.mkdir(parents=True, exist_ok=True)
    command = [
        sys.executable,
        "-m",
        "demucs",
        "--two-stems",
        stem_name,
        "-n",
        model_name,
        "--out",
        str(demucs_out),
        str(source_path),
    ]
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(
            f"Demucs failed: {result.stderr.strip() or result.stdout.strip()}"
        )

    source_stem = source_path.stem
    candidate_roots = [
        demucs_out / model_name / source_stem,
        demucs_out / "htdemucs_6s" / source_stem,
        demucs_out / "htdemucs" / source_stem,
        demucs_out / "mdx_extra_q" / source_stem,
    ]
    for root in candidate_roots:
        for extension in (".wav", ".mp3", ".flac"):
            candidate = root / f"{stem_name}{extension}"
            if candidate.exists():
                return candidate

    raise RuntimeError(f"Demucs completed but no {stem_name} stem was produced")


def _blend_recovered_harmonics(
    primary_stem_path: Path,
    recovery_stem_path: Path,
    workspace: Path,
) -> Path:
    try:
        import librosa
        import numpy as np
        import soundfile as sf
    except ImportError:
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

    if getattr(primary_audio, "ndim", 1) == 1:
        primary_channels = [primary_audio]
    else:
        primary_channels = [
            primary_audio[index] for index in range(primary_audio.shape[0])
        ]

    if getattr(recovery_audio, "ndim", 1) == 1:
        recovery_channels = [recovery_audio]
    else:
        recovery_channels = [
            recovery_audio[index] for index in range(recovery_audio.shape[0])
        ]

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
        peak = float(np.max(np.abs(blended))) if blended.size else 0.0
        if peak > 0:
            blended = blended / peak * 0.95
        blended_channels.append(blended.astype(np.float32, copy=False))

    blended_audio = (
        blended_channels[0]
        if len(blended_channels) == 1
        else np.vstack(blended_channels).T
    )
    blended_path = workspace / f"{primary_stem_path.stem}_hybrid.wav"
    try:
        sf.write(str(blended_path), blended_audio, sample_rate)
    except Exception:
        return primary_stem_path

    return blended_path
