import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { clerkAppearance } from "@/lib/clerk";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Plexus account to access the studio and profile tools.",
};

export default async function SignUpPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/studio");
  }

  return (
    <AuthPageShell
      eyebrow="Plexus account"
      title="Create your account and start inside Plexus."
      description="Set up your access and jump straight into the workspace."
      alternateHref="/sign-in"
      alternateLabel="Already have an account?"
    >
      <SignUp
        appearance={clerkAppearance}
        path="/sign-up"
        routing="path"
      />
    </AuthPageShell>
  );
}
