"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";

interface ResponsiveViewProps {
  mobile: React.ReactNode;
  desktop: React.ReactNode;
}

export function ResponsiveView({ mobile, desktop }: ResponsiveViewProps) {
  const isMobile = useIsMobile();
  return <>{isMobile ? mobile : desktop}</>;
}
