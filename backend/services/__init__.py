"""Service layer for transcription, storage, and export.

Layout:
- ``pipeline``   — orchestrates a full transcription job end-to-end
- ``inference``  — Demucs + Basic Pitch providers (local or Modal)
- ``refinement`` — pluggable post-transcription note refinement
- ``gp_export``  — writes note events to a Guitar Pro (``.gp5``) file
- ``jobs``       — in-memory store for async transcription jobs
- ``storage``    — persists generated artifacts for download
- ``audio``      — stem separation, stem enhancement, BPM detection
- ``notes``      — cleaning, quantization, fretboard mapping, MIDI export
"""
