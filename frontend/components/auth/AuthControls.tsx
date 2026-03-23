"use client";

import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { clerkUserButtonAppearance } from "@/lib/clerk";

type LandingMobileAuthActionsProps = {
  onNavigate?: () => void;
};

export function LandingDesktopAuthActions() {
  return (
    <div className="hidden items-center gap-3 lg:flex">
      <Button asChild variant="ghost" size="sm">
        <Link href="/studio/demo">Demo</Link>
      </Button>

      <Show when="signed-out">
        <Button asChild variant="ghost" size="sm">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/sign-up">Get started</Link>
        </Button>
      </Show>

      <Show when="signed-in">
        <Button asChild size="sm">
          <Link href="/studio">Open Studio</Link>
        </Button>
        <div className="clerk-user-button-anchor flex shrink-0 items-center">
          <UserButton
            appearance={clerkUserButtonAppearance}
            userProfileMode="navigation"
            userProfileUrl="/user-profile"
          />
        </div>
      </Show>
    </div>
  );
}

export function LandingMobileAuthActions({
  onNavigate,
}: LandingMobileAuthActionsProps) {
  return (
    <>
      <Button asChild variant="outline">
        <Link href="/studio/demo" onClick={onNavigate}>
          Preview the workspace
        </Link>
      </Button>

      <Show when="signed-out">
        <Button asChild variant="ghost">
          <Link href="/sign-in" onClick={onNavigate}>
            Sign in
          </Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up" onClick={onNavigate}>
            Create account
          </Link>
        </Button>
      </Show>

      <Show when="signed-in">
        <Button asChild>
          <Link href="/studio" onClick={onNavigate}>
            Open Studio
          </Link>
        </Button>
        <div className="flex items-center justify-between rounded-[16px] border border-white/8 bg-white/[0.03] px-4 py-3">
          <div>
            <p className="type-label text-white/38">Account</p>
            <p className="mt-2 text-sm text-white/72">
              Manage your profile and session.
            </p>
          </div>
          <div className="clerk-user-button-anchor flex shrink-0 items-center">
            <UserButton
              appearance={clerkUserButtonAppearance}
              userProfileMode="navigation"
              userProfileUrl="/user-profile"
            />
          </div>
        </div>
      </Show>
    </>
  );
}

export function StudioAuthControls() {
  return (
    <div className="flex items-center justify-end gap-3 whitespace-nowrap">
      <Show when="signed-out">
        <Button asChild variant="ghost" size="sm">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/sign-up">Create account</Link>
        </Button>
      </Show>

      <Show when="signed-in">
        <Button asChild variant="outline" size="sm">
          <Link href="/user-profile">Profile</Link>
        </Button>
        <div className="clerk-user-button-anchor flex shrink-0 items-center">
          <UserButton
            appearance={clerkUserButtonAppearance}
            userProfileMode="navigation"
            userProfileUrl="/user-profile"
          />
        </div>
      </Show>
    </div>
  );
}
