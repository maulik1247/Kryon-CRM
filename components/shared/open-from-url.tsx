"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface OpenFromUrlProps {
  /** Canonical record URL for a legacy `?open=` id. */
  getHref: (id: string) => string;
  canOpen?: (id: string) => boolean;
}

/** Redirects legacy `?open=<id>` links to full record pages. */
export function OpenFromUrl({ getHref, canOpen }: OpenFromUrlProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const openId = searchParams.get("open");
  const handledRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!openId || handledRef.current === openId) return;
    if (canOpen && !canOpen(openId)) return;

    handledRef.current = openId;
    router.replace(getHref(openId));

    const params = new URLSearchParams(searchParams.toString());
    params.delete("open");
    const nextQuery = params.toString();
    if (nextQuery) {
      router.replace(`${pathname}?${nextQuery}`, { scroll: false });
    }
  }, [openId, getHref, canOpen, pathname, router, searchParams]);

  return null;
}
