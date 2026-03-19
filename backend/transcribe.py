from pathlib import Path

from basic_pitch import ICASSP_2022_MODEL_PATH
from basic_pitch.inference import predict


def transcribe_audio(audio_file_path: str) -> None:
    model_output, midi_data, note_events = predict(
        audio_file_path,
        ICASSP_2022_MODEL_PATH,
    )

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

        print(f"Time: {start}s -> {end}s | MIDI pitch: {pitch} | Confidence: {confidence}")

if __name__ == "__main__":
    transcribe_audio("guitartest.wav")