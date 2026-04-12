import {
  AudioLines,
  ArrowRight,
  FileMusic,
  Gauge,
  Sparkles,
} from "lucide-react";

export const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 14,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.22,
        duration: 1.1,
      },
    },
  },
};

export const menuItems = [
  { name: "Workflow", href: "#workflow" },
  { name: "Preview", href: "#preview" },
  { name: "Exports", href: "#exports" },
  { name: "Audience", href: "#audience" },
];

export const signalItems = [
  { icon: AudioLines, label: "Audio intake" },
  { icon: Gauge, label: "Tempo + tuning" },
  { icon: Sparkles, label: "AI structuring" },
  { icon: FileMusic, label: "Export stack" },
];

export { ArrowRight };
