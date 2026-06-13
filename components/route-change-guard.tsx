"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/** Clears stray inline styles/classes left by overlays, sheets, or drag-and-drop. */
export function RouteChangeGuard() {
  const pathname = usePathname();

  React.useEffect(() => {
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("pointer-events");
    document.body.style.removeProperty("padding-right");
    document.body.style.removeProperty("margin-right");
    document.documentElement.style.removeProperty("overflow");
    document.documentElement.style.removeProperty("padding-right");
    document.body.classList.remove("cursor-grabbing", "pointer-events-none");
  }, [pathname]);

  return null;
}
