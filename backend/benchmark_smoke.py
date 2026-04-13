from __future__ import annotations

import argparse
import json
import shutil
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

import guitarpro

from core.config import settings
from services.gp_export import TICKS_PER_BEAT, build_gp5
from services.inference import get_inference_provider
from services.note_processing import (
    TranscriptionOptions,
    assign_fretboard_positions,
    clean_note_events,
    detect_bpm_from_stem,
    quantize_note_events,
    resolve_tuning_map,
    write_midi_from_note_events,
)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Benchmark Smoke on the Water against a reference GP5"
    )
    parser.add_argument(
        "--audio",
        type=Path,
        default=Path(__file__).resolve().parent / "mp3s" / "smokeonthewater.mp3",
    )
    parser.add_argument(
        "--reference-gp5",
        type=Path,
        default=Path(
            "/Users/andrewvasquez/Downloads/deep_purple-smoke_on_the_water_6.gp5"
        ),
    )
    parser.add_argument("--bars", type=int, default=8)
    parser.add_argument("--mode", default="riff")
    parser.add_argument("--tuning", default="standard")
    parser.add_argument("--capo", type=int, default=0)
    parser.add_argument("--bpm", type=float, default=None)
    args = parser.parse_args()

    workspace = _prepare_workspace(settings.guitar_stem_strategy)
    provider = get_inference_provider()
    options = TranscriptionOptions(
        bpm=args.bpm,
        tuning=args.tuning,
        capo=args.capo,
        mode=args.mode,
    )
    tuning_map = resolve_tuning_map(options.tuning, options.capo)

    stem_path = provider.isolate_guitar(args.audio, workspace)
    transcription = provider.transcribe_guitar(stem_path)
    raw_note_events = transcription["note_events"]
    bpm = options.bpm or detect_bpm_from_stem(stem_path)
    cleaned_note_events = clean_note_events(raw_note_events, options, tuning_map)
    quantized_note_events = quantize_note_events(cleaned_note_events, bpm, options.mode)
    final_note_events = assign_fretboard_positions(
        quantized_note_events, tuning_map, options.mode
    )

    midi_path = write_midi_from_note_events(
        final_note_events, workspace / "smoke_benchmark.mid"
    )
    gp5_path = build_gp5(
        note_events=final_note_events,
        bpm=bpm,
        tuning_map=tuning_map,
        time_signature=(
            options.time_signature_numerator,
            options.time_signature_denominator,
        ),
        output_path=workspace / "smoke_benchmark.gp5",
    )

    compared_transcription = _note_events_to_bar_window(
        final_note_events,
        bpm=bpm,
        numerator=options.time_signature_numerator,
        denominator=options.time_signature_denominator,
        bars=args.bars,
    )
    reference_notes = _reference_gp5_to_events(args.reference_gp5, bars=args.bars)
    summary = _build_summary(
        raw_count=len(raw_note_events),
        cleaned_count=len(cleaned_note_events),
        quantized_count=len(quantized_note_events),
        final_count=len(final_note_events),
        transcription_notes=compared_transcription,
        reference_notes=reference_notes,
        bpm=bpm,
        bars=args.bars,
        workspace=workspace,
        stem_path=stem_path,
        midi_path=midi_path,
        gp5_path=gp5_path,
    )

    summary_path = workspace / "benchmark_summary.json"
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary, indent=2))


def _prepare_workspace(strategy: str) -> Path:
    workspace = settings.work_dir / "benchmarks" / f"smoke_{strategy}"
    if workspace.exists():
        shutil.rmtree(workspace)
    workspace.mkdir(parents=True, exist_ok=True)
    return workspace


def _reference_gp5_to_events(
    reference_gp5_path: Path, bars: int
) -> list[dict[str, Any]]:
    song = guitarpro.parse(str(reference_gp5_path))
    track = song.tracks[0]
    if not track.strings:
        return []

    tuning_map = {string.number: string.value for string in track.strings}
    first_measure_start = (
        track.measures[0].header.start if track.measures else TICKS_PER_BEAT
    )
    cutoff_tick = first_measure_start + bars * _measure_ticks(song.measureHeaders[0])
    extracted: list[dict[str, Any]] = []

    for measure_index, measure in enumerate(track.measures[:bars], start=1):
        for voice in measure.voices:
            for beat in voice.beats:
                if not beat.notes:
                    continue

                start_tick = beat.start
                if start_tick >= cutoff_tick:
                    continue

                start_beats = (start_tick - first_measure_start) / TICKS_PER_BEAT
                duration_beats = beat.duration.time / TICKS_PER_BEAT
                for note in beat.notes:
                    open_pitch = tuning_map.get(note.string)
                    if open_pitch is None:
                        continue
                    extracted.append(
                        {
                            "bar": measure_index,
                            "start_beats": start_beats,
                            "duration_beats": duration_beats,
                            "pitch_midi": open_pitch + note.value,
                        }
                    )

    extracted.sort(key=lambda note: (note["start_beats"], note["pitch_midi"]))
    return extracted


def _note_events_to_bar_window(
    note_events: list[dict[str, float | int]],
    bpm: float,
    numerator: int,
    denominator: int,
    bars: int,
) -> list[dict[str, Any]]:
    beats_per_bar = numerator * (4.0 / denominator)
    extracted: list[dict[str, Any]] = []

    for note in note_events:
        start_beats = float(note["start_s"]) * (bpm / 60.0)
        duration_beats = (float(note["end_s"]) - float(note["start_s"])) * (bpm / 60.0)
        extracted.append(
            {
                "start_beats": start_beats,
                "duration_beats": duration_beats,
                "pitch_midi": int(note["pitch_midi"]),
            }
        )

    if not extracted:
        return []

    first_start_beats = min(note["start_beats"] for note in extracted)
    max_beats = bars * beats_per_bar
    aligned: list[dict[str, Any]] = []
    for note in extracted:
        aligned_start_beats = float(note["start_beats"]) - first_start_beats
        if aligned_start_beats >= max_beats:
            continue
        aligned.append(
            {
                "bar": int(aligned_start_beats // beats_per_bar) + 1,
                "start_beats": aligned_start_beats,
                "duration_beats": float(note["duration_beats"]),
                "pitch_midi": int(note["pitch_midi"]),
            }
        )

    extracted = aligned
    extracted.sort(key=lambda note: (note["start_beats"], note["pitch_midi"]))
    return extracted


def _measure_ticks(header: guitarpro.models.MeasureHeader) -> int:
    numerator = header.timeSignature.numerator
    denominator = header.timeSignature.denominator.value
    return int(numerator * TICKS_PER_BEAT * (4 / denominator))


def _build_summary(
    raw_count: int,
    cleaned_count: int,
    quantized_count: int,
    final_count: int,
    transcription_notes: list[dict[str, Any]],
    reference_notes: list[dict[str, Any]],
    bpm: float,
    bars: int,
    workspace: Path,
    stem_path: Path,
    midi_path: Path,
    gp5_path: Path,
) -> dict[str, Any]:
    transcription_groups = _group_pitch_sets(transcription_notes)
    reference_groups = _group_pitch_sets(reference_notes)
    transcription_keys = set(transcription_groups)
    reference_keys = set(reference_groups)
    matching_keys = transcription_keys & reference_keys
    exact_matches = sum(
        1 for key in matching_keys if transcription_groups[key] == reference_groups[key]
    )

    transcription_pairs = _top_pitch_sets(transcription_groups)
    reference_pairs = _top_pitch_sets(reference_groups)
    shared_pair_count = sum(
        min(transcription_pairs.get(pair, 0), reference_pairs.get(pair, 0))
        for pair in transcription_pairs.keys() & reference_pairs.keys()
    )

    return {
        "workspace": str(workspace),
        "stem_path": str(stem_path),
        "midi_path": str(midi_path),
        "gp5_path": str(gp5_path),
        "bars_compared": bars,
        "bpm": bpm,
        "counts": {
            "raw": raw_count,
            "cleaned": cleaned_count,
            "quantized": quantized_count,
            "final": final_count,
            "reference_first_bars": len(reference_notes),
            "transcription_first_bars": len(transcription_notes),
        },
        "onset_groups": {
            "reference": len(reference_groups),
            "transcription": len(transcription_groups),
            "shared_onsets": len(matching_keys),
            "exact_pitch_set_matches": exact_matches,
        },
        "top_pitch_sets": {
            "reference": [
                {"pitches": list(pitches), "count": count}
                for pitches, count in reference_pairs.most_common(12)
            ],
            "transcription": [
                {"pitches": list(pitches), "count": count}
                for pitches, count in transcription_pairs.most_common(12)
            ],
            "shared_occurrence_count": shared_pair_count,
        },
        "first_onsets": {
            "reference": _preview_onset_groups(reference_groups, limit=20),
            "transcription": _preview_onset_groups(transcription_groups, limit=20),
        },
    }


def _group_pitch_sets(note_events: list[dict[str, Any]]) -> dict[int, tuple[int, ...]]:
    grouped: dict[int, set[int]] = defaultdict(set)
    for note in note_events:
        onset_step = int(round(float(note["start_beats"]) * 4))
        grouped[onset_step].add(int(note["pitch_midi"]))
    return {step: tuple(sorted(pitches)) for step, pitches in sorted(grouped.items())}


def _top_pitch_sets(
    grouped_pitch_sets: dict[int, tuple[int, ...]],
) -> Counter[tuple[int, ...]]:
    return Counter(pitches for pitches in grouped_pitch_sets.values() if pitches)


def _preview_onset_groups(
    grouped_pitch_sets: dict[int, tuple[int, ...]], limit: int
) -> list[dict[str, Any]]:
    preview: list[dict[str, Any]] = []
    for onset_step, pitches in list(grouped_pitch_sets.items())[:limit]:
        preview.append(
            {
                "sixteenth_step": onset_step,
                "beat": onset_step / 4.0,
                "pitches": list(pitches),
            }
        )
    return preview


if __name__ == "__main__":
    main()
