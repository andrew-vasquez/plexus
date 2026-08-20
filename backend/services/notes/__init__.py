"""Note-event math for transcription.

This package contains every step that turns raw note events from Basic
Pitch into a playable tab:

- ``options``       — transcription options, tuning presets, shared constants
- ``cleaning``      — removing false positives and noise from raw notes
- ``quantization``  — snapping note timing to a rhythmic grid
- ``fretboard``     — choosing which string/fret plays each pitch
- ``midi``          — exporting note events to MIDI and API previews
"""

from __future__ import annotations
