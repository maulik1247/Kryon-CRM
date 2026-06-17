"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/** Defer navigation so dev bundler can finish API-route compilations before RSC flight. */
export function navigateAfterSave(router: AppRouterInstance, href: string) {
  window.setTimeout(() => {
    router.push(href);
  }, 0);
}
