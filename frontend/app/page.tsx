import { LandingFooter } from "@/components/landing/LandingFooter";
import { HeroHeader } from "@/components/landing/HeroHeader";
import { HeroIntro } from "@/components/landing/HeroIntro";
import { LandingSections } from "@/components/landing/LandingSections";
import { SignalStrip } from "@/components/landing/SignalStrip";

export default function Home() {
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
