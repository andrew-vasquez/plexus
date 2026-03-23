import type { Metadata } from "next";
import { MotionShowcase } from "@/components/showcase/MotionShowcase";

export const metadata: Metadata = {
  title: "Motion Showcase",
  description: "Interactive motion studies inspired by the supplied recording.",
};

export default function ShowcasePage() {
  return <MotionShowcase />;
}
