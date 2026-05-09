"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AuthSync() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const lastUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded) return;

    // Detect a transition from logged out to logged in
    if (lastUserId.current === null && userId) {
      // Force a hard navigation to guarantee server components receive the new cookies
      // and bypass any stale Next.js App Router client caches.
      window.location.href = "/dashboard";
      return;
    }

    lastUserId.current = userId;
  }, [isLoaded, userId, pathname, router]);

  return null;
}
