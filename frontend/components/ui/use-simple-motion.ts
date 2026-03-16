"use client";

import { useSyncExternalStore } from "react";

const SIMPLE_MOTION_QUERY = "(hover: none), (pointer: coarse)";

function getMediaQueryList() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.matchMedia(SIMPLE_MOTION_QUERY);
}

function subscribe(onStoreChange: () => void) {
  const mediaQuery = getMediaQueryList();
  const legacyMediaQuery = mediaQuery as MediaQueryList & {
    addListener?: (listener: () => void) => void;
    removeListener?: (listener: () => void) => void;
  };

  if (!mediaQuery) {
    return () => {};
  }

  if ("addEventListener" in mediaQuery) {
    mediaQuery.addEventListener("change", onStoreChange);
    return () => mediaQuery.removeEventListener("change", onStoreChange);
  }

  legacyMediaQuery.addListener?.(onStoreChange);
  return () => legacyMediaQuery.removeListener?.(onStoreChange);
}

function getSnapshot() {
  return getMediaQueryList()?.matches ?? false;
}

export function useSimpleMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

function subscribeToHydration() {
  return () => {};
}

export function useHydrated() {
  return useSyncExternalStore(subscribeToHydration, () => true, () => false);
}
