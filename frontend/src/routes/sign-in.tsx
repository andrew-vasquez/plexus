import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { clerkAppearance } from "@/lib/clerk";

export const Route = createFileRoute("/sign-in")({
  beforeLoad: ({ context }) => {
    if (context.userId) {
      throw redirect({ to: "/studio" });
    }
  },
  head: () => ({
    meta: [
      { title: "Sign In | Plexus" },
      {
        name: "description",
        content: "Access the Plexus studio and manage your account.",
      },
    ],
  }),
  component: SignInRoute,
});

function SignInRoute() {
  return (
    <AuthPageShell
      eyebrow="Plexus access"
      title="Sign in and get back to work."
      description="Open your workspace, review takes, and keep moving."
      alternateHref="/sign-up"
      alternateLabel="Need an account?"
    >
      <SignIn appearance={clerkAppearance} path="/sign-in" routing="path" />
    </AuthPageShell>
  );
}
