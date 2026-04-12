import {
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/tanstack-react-start";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { clerkUserButtonAppearance } from "@/lib/clerk";

type LandingMobileAuthActionsProps = {
  onNavigate?: () => void;
};

export function LandingDesktopAuthActions() {
  return (
    <div className="hidden items-center gap-3 lg:flex">
      <Button asChild variant="ghost" size="sm">
        <Link to="/studio/demo">Demo</Link>
      </Button>

      <SignedOut>
        <Button asChild variant="ghost" size="sm">
          <Link to="/sign-in">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link to="/sign-up">Get started</Link>
        </Button>
      </SignedOut>

      <SignedIn>
        <Button asChild size="sm">
          <Link to="/studio">Open Studio</Link>
        </Button>
        <div className="clerk-user-button-anchor flex shrink-0 items-center">
          <UserButton
            appearance={clerkUserButtonAppearance}
            userProfileMode="navigation"
            userProfileUrl="/user-profile"
          />
        </div>
      </SignedIn>
    </div>
  );
}

export function LandingMobileAuthActions({
  onNavigate,
}: LandingMobileAuthActionsProps) {
  return (
    <>
      <Button asChild variant="outline">
        <Link to="/studio/demo" onClick={onNavigate}>
          Preview the workspace
        </Link>
      </Button>

      <SignedOut>
        <Button asChild variant="ghost">
          <Link to="/sign-in" onClick={onNavigate}>
            Sign in
          </Link>
        </Button>
        <Button asChild>
          <Link to="/sign-up" onClick={onNavigate}>
            Create account
          </Link>
        </Button>
      </SignedOut>

      <SignedIn>
        <Button asChild>
          <Link to="/studio" onClick={onNavigate}>
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
      </SignedIn>
    </>
  );
}

export function StudioAuthControls() {
  return (
    <div className="flex items-center justify-end gap-3 whitespace-nowrap">
      <SignedOut>
        <Button asChild variant="ghost" size="sm">
          <Link to="/sign-in">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link to="/sign-up">Create account</Link>
        </Button>
      </SignedOut>

      <SignedIn>
        <Button asChild variant="outline" size="sm">
          <Link to="/user-profile">Profile</Link>
        </Button>
        <div className="clerk-user-button-anchor flex shrink-0 items-center">
          <UserButton
            appearance={clerkUserButtonAppearance}
            userProfileMode="navigation"
            userProfileUrl="/user-profile"
          />
        </div>
      </SignedIn>
    </div>
  );
}
