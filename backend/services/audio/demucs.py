"""Runs Demucs source separation as a subprocess.

Demucs is a neural network that splits a song into separate instrument
stems (drums, bass, vocals, guitar, ...). We only need the guitar stem,
so we always run it in ``--two-stems`` mode.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def run_demucs_two_stem(
    source_path: Path,
    workspace: Path,
    stem_name: str,
    model_name: str,
    run_name: str,
) -> Path:
    """Separate ``stem_name`` (e.g. ``"guitar"``) out of an audio file.

    Demucs writes its output to ``{workspace}/demucs_{run_name}/{model}/{source}/{stem}.wav``.

    Args:
        source_path: the audio file to separate.
        workspace: a scratch directory where Demucs output is written.
        stem_name: which stem to isolate (``"guitar"`` or ``"other"``).
        model_name: the Demucs model (``htdemucs_6s`` has a dedicated guitar stem).
        run_name: a label so multiple Demucs runs inside one job don't collide.

    Returns:
        The path to the extracted stem file.

    Raises:
        RuntimeError: if Demucs fails or produces no usable output.
    """
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
