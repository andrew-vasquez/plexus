"""Typed shapes for note events shared across the note pipeline.

Notes start life as raw detections from Basic Pitch — timing, pitch, and
amplitude only — and gain fretboard positions (``string_number``/``fret``)
in a later pipeline stage. ``NoteEvent`` describes the pre-fretboard shape
and ``TabbedNoteEvent`` the finished one.
"""

from __future__ import annotations

from typing import TypedDict


class NoteEvent(TypedDict):
    """One detected note before fretboard assignment."""

    start_s: float
    end_s: float
    pitch_midi: int
    amplitude: float


class TabbedNoteEvent(NoteEvent):
    """A note with a chosen string and fret, ready for tab export."""

    string_number: int
    fret: int