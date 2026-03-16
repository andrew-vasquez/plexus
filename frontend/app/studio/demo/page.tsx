import type { Metadata } from "next";
import { DemoWorkspace } from "@/components/studio/DemoWorkspace";

export const metadata: Metadata = {
  title: "Plexus Demo Workspace",
  description: "Preview the tab viewer, transport controls, and export system for Plexus.",
};

export default function DemoPage() {
  return <DemoWorkspace />;
}
