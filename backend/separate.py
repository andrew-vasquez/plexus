import subprocess
import os
from pathlib import Path
from pydub import AudioSegment

ALL_STEMS = ["drums", "bass", "vocals", "guitar", "piano", "other"]


def load_audio(file_path: str) -> AudioSegment:
    ext = Path(file_path).suffix.lower()
    if ext == ".mp3":
        return AudioSegment.from_mp3(file_path)
    elif ext == ".wav":
        return AudioSegment.from_wav(file_path)
    elif ext == ".flac":
        return AudioSegment.from_file(file_path, format="flac")
    else:
        raise ValueError(f"Unsupported file format: {ext}")


def separate_stems(audio_file_path: str, stems_to_remove: list[str]) -> str:
    """
    Takes an audio file and a list of stems to remove.
    Returns the path to the mixed output file.
    """

    print(f"Separating stems from {audio_file_path}...")
    subprocess.run(
        ["python", "-m", "demucs", "--model", "htdemucs_6s", audio_file_path]
    )

    # Build path to where Demucs put the stems
    # Same pattern as before but htdemucs_6s folder instead
    filename = Path(audio_file_path).stem
    stems_dir = f"separated/htdemucs_6s/{filename}"

    if not os.path.exists(stems_dir):
        raise Exception(f"Demucs output not found at {stems_dir}")

    # Figure out which stems to keep — everything not in the remove list
    stems_to_keep = [s for s in ALL_STEMS if s not in stems_to_remove]
    print(f"Keeping stems: {stems_to_keep}")
    print(f"Removing stems: {stems_to_remove}")

    # Mix the kept stems together using pydub
    result = None

    for stem in stems_to_keep:
        stem_path = f"{stems_dir}/{stem}.mp3"

        if not os.path.exists(stem_path):
            raise Exception(f"Stem file not found: {stem_path}")

        audio = load_audio(stem_path)

        if result is None:
            result = audio  # first stem becomes the base
        else:
            result = result.overlay(audio)  # layer each stem on top

    if result is None:
        raise Exception("No stems to keep — cannot produce output")

    # Export the mixed result
    output_path = f"separated/htdemucs_6s/{filename}/output_mixed.mp3"
    result.export(output_path, format="mp3")
    print(f"Mixed output saved to: {output_path}")

    return output_path
