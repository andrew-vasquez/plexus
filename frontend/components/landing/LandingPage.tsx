"use client";

import { HeroHeader } from "@/components/landing/HeroHeader";
import { HeroIntro } from "@/components/landing/HeroIntro";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingSections } from "@/components/landing/LandingSections";
import { SignalStrip } from "@/components/landing/SignalStrip";

export function LandingPage() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-x-hidden">
        <HeroIntro />
        <SignalStrip />
        <LandingSections />
      </main>
      <LandingFooter />
    </>
  );
}
