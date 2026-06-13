"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface OpenFromUrlProps {
  onOpen: (id: string) => void;
  canOpen?: (id: string) => boolean;
}

export function OpenFromUrl({ onOpen, canOpen }: OpenFromUrlProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const openId = searchParams.get("open");
  const handledRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!openId || handledRef.current === openId) return;
    if (canOpen && !canOpen(openId)) return;

    handledRef.current = openId;
    onOpen(openId);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("open");
    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [openId, onOpen, canOpen, pathname, router, searchParams]);

  return null;
}
