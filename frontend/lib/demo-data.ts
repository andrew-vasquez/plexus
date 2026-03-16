import type { LucideIcon } from "lucide-react";
import {
  AudioWaveform,
  FileMusic,
  Gauge,
  Sparkles,
  WandSparkles,
  Waves,
} from "lucide-react";

export type UploadPhase = "idle" | "uploading" | "processing" | "ready" | "error";

type HeroStat = {
  label: string;
  value: string;
  description: string;
};

type WorkflowStep = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type FeatureCard = {
  kicker: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

type AudienceCard = {
  title: string;
  description: string;
};

type DemoSection = {
  name: string;
  measures: string;
  note: string;
};

type DemoMeasure = {
  number: number;
  label: string;
  chord: string;
  strings: string[];
};

type DemoExport = {
  label: string;
  detail: string;
};

export const heroStats: HeroStat[] = [
  {
    label: "Output stack",
    value: "GP / PDF / MIDI",
    description: "Deliver the part in the formats players and teachers already expect.",
  },
  {
    label: "Session tone",
    value: "Black minimal",
    description: "A premium control-room feel with technical hierarchy and no clutter.",
  },
  {
    label: "Review pass",
    value: "Browser first",
    description: "Inspect sections, measures, and exports before a deeper player lands.",
  },
];

export const workflowSteps: WorkflowStep[] = [
  {
    title: "Drop the take",
    description:
      "Bring in the stem, memo, or full song and let Plexus begin with a clean, confidence-building intake state.",
    icon: AudioWaveform,
  },
  {
    title: "Map the structure",
    description:
      "Tempo, tuning, density, and section logic appear as a guided signal chain instead of a generic progress bar.",
    icon: Waves,
  },
  {
    title: "Export or refine",
    description:
      "Move into a browser review surface that feels ready for Guitar Pro exports, PDF handoff, or future playback.",
    icon: FileMusic,
  },
];

export const featureCards: FeatureCard[] = [
  {
    kicker: "Precision pass",
    title: "A workspace that suggests control before the engine does everything.",
    description:
      "The MVP UI should already feel like it understands sections, difficulty, and arrangement logic. That trust matters before full transcription depth arrives.",
    icon: Gauge,
  },
  {
    kicker: "AI direction",
    title: "Signal-rich states instead of vague loading screens.",
    description:
      "Every transition explains what Plexus is doing: ingesting, mapping, structuring, then handing off into a playable tab review.",
    icon: Sparkles,
  },
  {
    kicker: "Product growth",
    title: "Designed to grow into a custom player, not get replaced by one.",
    description:
      "The visual system leaves room for transport controls, measure sync, and future Guitar Pro support without changing the identity later.",
    icon: WandSparkles,
  },
];

export const audienceCards: AudienceCard[] = [
  {
    title: "Serious guitarists",
    description:
      "Bring recordings back into a clean tab workflow when your ear is faster than your patience.",
  },
  {
    title: "Teachers",
    description:
      "Convert lesson fragments and practice references into handoff-ready tabs without losing structure.",
  },
  {
    title: "Newer players",
    description:
      "Use a clearer interface for seeing where the part lives, how sections repeat, and what to export for practice.",
  },
];

export const demoSession = {
  title: "Velvet Lights",
  artist: "Plexus Demo Session",
  duration: "03:14",
  tuning: "Drop D",
  detectedTempo: "112 BPM",
  confidence: "96% structure confidence",
  notes: "Detected tight palm-muted verse with an open, wider chorus release.",
  sections: [
    {
      name: "Intro",
      measures: "1-4",
      note: "Muted octave lead-in with sparse sustain.",
    },
    {
      name: "Verse",
      measures: "5-12",
      note: "Palm-muted chug pattern with syncopated turnaround.",
    },
    {
      name: "Chorus",
      measures: "13-20",
      note: "Open-string lift and wider interval movement.",
    },
  ] satisfies DemoSection[],
  measures: [
    {
      number: 1,
      label: "Signal intro",
      chord: "D5",
      strings: [
        "e|----------------|",
        "B|----------------|",
        "G|----------------|",
        "D|--0---0---------|",
        "A|--0---0---3-2---|",
        "D|--0---0---3-2---|",
      ],
    },
    {
      number: 2,
      label: "Pickup",
      chord: "F5",
      strings: [
        "e|----------------|",
        "B|----------------|",
        "G|----------------|",
        "D|------3---3-----|",
        "A|--3-3---3---5-3-|",
        "D|--3-3---3---5-3-|",
      ],
    },
    {
      number: 3,
      label: "Verse lock",
      chord: "Bb5",
      strings: [
        "e|----------------|",
        "B|----------------|",
        "G|----------------|",
        "D|--8---8-----8---|",
        "A|--8---8-6-8---6-|",
        "D|--8---8-6-8---6-|",
      ],
    },
    {
      number: 4,
      label: "Release",
      chord: "C5",
      strings: [
        "e|----------------|",
        "B|----------------|",
        "G|----------------|",
        "D|--10--10----10--|",
        "A|--10--10-8--10--|",
        "D|--10--10-8--10--|",
      ],
    },
  ] satisfies DemoMeasure[],
  exports: [
    {
      label: "Guitar Pro draft",
      detail: "Bar markers, tuning, and phrasing ready for a handoff file.",
    },
    {
      label: "Practice PDF",
      detail: "Readable tab format with section dividers and tempo notes.",
    },
    {
      label: "MIDI sketch",
      detail: "Quick arrangement layer for rehearsal or DAW reference.",
    },
  ] satisfies DemoExport[],
};

export const studioSignals = [
  {
    label: "Detected profile",
    value: `${demoSession.detectedTempo} • ${demoSession.tuning}`,
    icon: Gauge,
  },
  {
    label: "Tab readiness",
    value: demoSession.confidence,
    icon: Sparkles,
  },
  {
    label: "Export handoff",
    value: "GP5 / PDF / MIDI queued",
    icon: FileMusic,
  },
];
