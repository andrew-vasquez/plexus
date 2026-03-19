import subprocess
import os
import time
from pathlib import Path
from basic_pitch import ICASSP_2022_MODEL_PATH
from basic_pitch.inference import predict


def find_guitar_stem(stems_dir: str) -> str:
    # Check for both formats since Demucs output format
    # depends on whether --mp3 flag was used
    for ext in [".mp3", ".wav", ".flac"]:
        path = f"{stems_dir}/guitar{ext}"
        if os.path.exists(path):
            return path
    raise Exception(f"Could not find guitar stem in {stems_dir}")


def separate_guitar(audio_file_path: str) -> str:
    print("Separating guitar from mix...")
    subprocess.run(
        [
            "python3",
            "-m",
            "demucs",
            "-n",
            "htdemucs_6s",
            "--two-stems=guitar",
            "--mp3",
            audio_file_path,
        ]
    )

    filename = Path(audio_file_path).stem
    stems_dir = f"separated/htdemucs_6s/{filename}"

    # Use the finder instead of hardcoding the extension
    guitar_path = find_guitar_stem(stems_dir)

    print(f"Guitar isolated at: {guitar_path}")
    return guitar_path


def transcribe_audio(audio_file_path: str) -> list:
    model_output, midi_data, note_events = predict(
        audio_file_path,
        ICASSP_2022_MODEL_PATH,
    )

    # Save the MIDI file next to the input file — keeping your original logic
    audio_path = Path(audio_file_path)
    midi_output_path = audio_path.with_suffix(".mid")
    midi_data.write(str(midi_output_path))
    print(f"Saved MIDI to {midi_output_path}")

    print(f"Found {len(note_events)} notes.")
    print("----")

    for start_time, end_time, pitch_midi, amplitude, _pitch_bends in note_events:
        start = round(start_time, 3)
        end = round(end_time, 3)
        pitch = int(pitch_midi)
        confidence = round(amplitude, 2)
        print(
            f"Time: {start}s -> {end}s | MIDI pitch: {pitch} | Confidence: {confidence}"
        )

    return note_events


def process_song(audio_file_path: str) -> list:
    start_time = time.time()

    # Step 1 — isolate guitar from full mix
    guitar_path = separate_guitar(audio_file_path)

    # Step 2 — transcribe the isolated guitar
    notes = transcribe_audio(guitar_path)

    elapsed = round(time.time() - start_time, 2)
    print(f"Total processing time: {elapsed} seconds")

    return notes


if __name__ == "__main__":
    # Use process_song for a full mix like a real song
    process_song("chimera.mp3")

    # Or use transcribe_audio directly if you already have a clean guitar recording
    # transcribe_audio("guitartest.wav")
