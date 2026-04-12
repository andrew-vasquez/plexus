import { SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { clerkAppearance } from "@/lib/clerk";

export const Route = createFileRoute("/sign-up/$")({
  beforeLoad: ({ context }) => {
    if (context.userId) {
      throw redirect({ to: "/studio" });
    }
  },
  head: () => ({
    meta: [
      { title: "Create Account | Plexus" },
      {
        name: "description",
        content:
          "Create a Plexus account to access the studio and profile tools.",
      },
    ],
  }),
  component: SignUpRoute,
});

function SignUpRoute() {
  return (
    <AuthPageShell
      eyebrow="Plexus account"
      title="Create your account and start inside Plexus."
      description="Set up your access and jump straight into the workspace."
      alternateHref="/sign-in"
      alternateLabel="Already have an account?"
    >
      <SignUp appearance={clerkAppearance} path="/sign-up" routing="path" />
    </AuthPageShell>
  );
}
