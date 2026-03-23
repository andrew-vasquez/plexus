import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { clerkAppearance } from "@/lib/clerk";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Access the Plexus studio and manage your account.",
};

export default async function SignInPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/studio");
  }

  return (
    <AuthPageShell
      eyebrow="Plexus access"
      title="Sign in and get back to work."
      description="Open your workspace, review takes, and keep moving."
      alternateHref="/sign-up"
      alternateLabel="Need an account?"
    >
      <SignIn
        appearance={clerkAppearance}
        path="/sign-in"
        routing="path"
      />
    </AuthPageShell>
  );
}
