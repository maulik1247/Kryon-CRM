"use client";

import { AppShell } from "@/components/layout/app-shell";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { useAuth } from "@/lib/auth-provider";

export function DashboardShell() {
  const { currentUser } = useAuth();

  return (
    <AppShell title={`Hello, ${currentUser.name}`}>
      <DashboardView />
    </AppShell>
  );
}
