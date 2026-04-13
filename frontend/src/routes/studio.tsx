import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { StudioShell } from "@/components/studio/StudioShell";
import { requireUser } from "@/lib/auth";

export const Route = createFileRoute("/studio")({
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/studio/demo") {
      return;
    }

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
  const { pathname } = useLocation();

  if (pathname === "/studio") {
    return <StudioShell />;
  }

  return <Outlet />;
}
