import type { MouseEvent } from "react";

export function scrollToHash(
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
  onComplete?: () => void,
) {
  const targetId = href.replace("#", "");
  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  event.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", href);
  onComplete?.();
}
