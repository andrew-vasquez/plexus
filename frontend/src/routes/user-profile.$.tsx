import { UserProfile } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import { StudioPageFrame, StudioTopBar } from "@/components/studio/shared";
import { requireUser } from "@/lib/auth";
import { clerkAppearance } from "@/lib/clerk";

export const Route = createFileRoute("/user-profile/$")({
  beforeLoad: async () => {
    await requireUser();
  },
  head: () => ({
    meta: [
      { title: "Profile | Plexus" },
      {
        name: "description",
        content: "Manage your Plexus account, session, and profile details.",
      },
    ],
  }),
  component: UserProfileRoute,
});

function UserProfileRoute() {
  return (
    <StudioPageFrame>
      <StudioTopBar backHref="/studio" backLabel="Back to studio" />

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,18,20,0.94),rgba(10,10,12,0.98))] p-4 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.88)] sm:rounded-[26px] sm:p-6 lg:p-8">
          <div className="min-w-0 max-w-3xl">
            <p className="type-label text-[var(--color-accent)]">User profile</p>
            <h1 className="type-display mt-4 text-balance text-3xl tracking-[-0.06em] text-white sm:text-4xl lg:text-5xl">
              Manage your account without leaving the Plexus shell.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/62 sm:text-lg">
              Update your identity details, avatar, and session settings from a
              surface that matches the rest of the product UI.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-[18px] border border-white/8 bg-black/28 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:mt-8 sm:rounded-[22px] sm:p-4">
            <div className="w-full min-w-0">
              <UserProfile
                appearance={clerkAppearance}
                path="/user-profile"
                routing="path"
              />
            </div>
          </div>
        </div>
      </section>
    </StudioPageFrame>
  );
}
