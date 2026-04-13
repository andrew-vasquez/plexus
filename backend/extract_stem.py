from __future__ import annotations

import argparse
import shutil
from pathlib import Path

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
    args = parser.parse_args()

    workspace = Path(__file__).resolve().parent / "work" / "stem_test"
    if workspace.exists():
        shutil.rmtree(workspace)
    workspace.mkdir(parents=True, exist_ok=True)

    provider = get_inference_provider()
    stem_path = provider.isolate_guitar(args.audio, workspace)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(stem_path, args.output)

    print(f"audio={args.audio}")
    print(f"workspace={workspace}")
    print(f"stem={stem_path}")
    print(f"copied_to={args.output}")


if __name__ == "__main__":
    main()
