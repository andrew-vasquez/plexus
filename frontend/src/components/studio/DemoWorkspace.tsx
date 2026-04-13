import { demoSession } from "@/lib/demo-data";
import {
  DemoRightRail,
  DemoSectionsRail,
  DemoTabPanel,
  DemoTransportBar,
} from "@/components/studio/demo-workspace-sections";
import {
  StudioPageFrame,
  StudioSurface,
  StudioTopBar,
} from "@/components/studio/shared";

export function DemoWorkspace() {
  return (
    <StudioPageFrame>
      <StudioTopBar
        backHref="/studio"
        backLabel="Back to studio"
        showAuthControls={false}
      />

      <StudioSurface
        eyebrow="Demo workspace"
        title={demoSession.title}
        description={`${demoSession.artist} • ${demoSession.detectedTempo} • ${demoSession.tuning} • ${demoSession.duration}`}
        stats={[
          { label: "Confidence", value: demoSession.confidence },
          { label: "Sections", value: `${demoSession.sections.length} mapped` },
          { label: "Exports", value: "GP5 / PDF / MIDI" },
        ]}
      >
        <div className="mt-8 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <DemoSectionsRail />
          <DemoTabPanel />
          <DemoRightRail />
        </div>
        <DemoTransportBar />
      </StudioSurface>
    </StudioPageFrame>
  );
}
