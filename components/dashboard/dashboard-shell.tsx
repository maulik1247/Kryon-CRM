"use client";

import dynamic from "next/dynamic";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { useAuth } from "@/lib/auth-provider";

const DashboardView = dynamic(
  () =>
    import("@/components/dashboard/dashboard-view").then(
      (mod) => mod.DashboardView
    ),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false,
  }
);

export function DashboardShell() {
  const { currentUser } = useAuth();

  return (
    <AppShell title={`Hello, ${currentUser.name}`}>
      <DashboardView />
    </AppShell>
  );
}
