import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActionLinkProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
};

export function ActionLink({
  children,
  href,
  variant = "primary",
}: ActionLinkProps) {
  return (
    <Link
      className={cn(
        buttonVariants({
          variant:
            variant === "primary"
              ? "default"
              : variant === "secondary"
                ? "outline"
                : "ghost",
          size: "default",
        }),
      )}
      href={href}
    >
      {children}
    </Link>
  );
}
