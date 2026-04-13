from __future__ import annotations

import argparse
import shutil
from pathlib import Path

from core.config import settings
from services.inference import get_inference_provider


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract and inspect the current guitar stem"
    )
    parser.add_argument(
        "audio",
        type=Path,
        nargs="?",
        default=Path(__file__).resolve().parent / "mp3s" / "smokeonthewater.mp3",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parent
        / "outputs"
        / "test_stems"
        / "smoke_guitar.wav",
    )
    parser.add_argument(
        "--preview-output",
        type=Path,
        default=Path(__file__).resolve().parent
        / "outputs"
        / "test_stems"
        / "smoke_guitar_preview.wav",
    )
    args = parser.parse_args()

    workspace = (
        Path(__file__).resolve().parent
        / "work"
        / f"stem_test_{settings.guitar_stem_strategy}"
    )
    if workspace.exists():
        shutil.rmtree(workspace)
    workspace.mkdir(parents=True, exist_ok=True)

    provider = get_inference_provider()
    stem_path = provider.isolate_guitar(args.audio, workspace)
    preview_stem_path = provider.create_preview_stem(stem_path, workspace)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.preview_output.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(stem_path, args.output)
    shutil.copy2(preview_stem_path, args.preview_output)

    print(f"audio={args.audio}")
    print(f"workspace={workspace}")
    print(f"transcription_stem={stem_path}")
    print(f"preview_stem={preview_stem_path}")
    print(f"copied_to={args.output}")
    print(f"preview_copied_to={args.preview_output}")


if __name__ == "__main__":
    main()
