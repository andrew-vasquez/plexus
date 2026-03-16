import type { Metadata } from "next";
import { StudioShell } from "@/components/studio/StudioShell";

export const metadata: Metadata = {
  title: "Plexus Studio",
  description: "Upload audio, monitor the signal chain, and move toward a playable tab.",
};

export default function StudioPage() {
  return <StudioShell />;
}
