import { createFileRoute } from "@tanstack/react-router";
import { StudioShell } from "@/components/studio/StudioShell";
import { requireUser } from "@/lib/auth";

export const Route = createFileRoute("/studio")({
  beforeLoad: async () => {
    await requireUser();
  },
  head: () => ({
    meta: [
      { title: "Plexus Studio | Plexus" },
      {
        name: "description",
        content:
          "Upload audio, monitor the signal chain, and move toward a playable tab.",
      },
    ],
  }),
  component: StudioRoute,
});

function StudioRoute() {
  return <StudioShell />;
}
