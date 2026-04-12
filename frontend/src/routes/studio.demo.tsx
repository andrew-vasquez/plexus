import { createFileRoute } from "@tanstack/react-router";
import { DemoWorkspace } from "@/components/studio/DemoWorkspace";

export const Route = createFileRoute("/studio/demo")({
  head: () => ({
    meta: [
      { title: "Demo Workspace | Plexus" },
      {
        name: "description",
        content: "Review the staged transcription workspace inside Plexus.",
      },
    ],
  }),
  component: DemoRoute,
});

function DemoRoute() {
  return <DemoWorkspace />;
}
