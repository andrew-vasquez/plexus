import { createFileRoute } from "@tanstack/react-router";
import { HeroHeader } from "@/components/landing/HeroHeader";
import { HeroIntro } from "@/components/landing/HeroIntro";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingSections } from "@/components/landing/LandingSections";
import { SignalStrip } from "@/components/landing/SignalStrip";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Plexus" },
      {
        name: "keywords",
        content:
          "Plexus, guitar tab transcription, guitar pro, audio to tabs, music transcription",
      },
    ],
  }),
  component: HomeRoute,
});

function HomeRoute() {
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
