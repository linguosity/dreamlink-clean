"use client";

import { useVersionCheck } from "@/hooks/use-version-check";

export function VersionChecker() {
  useVersionCheck();
  return null;
}