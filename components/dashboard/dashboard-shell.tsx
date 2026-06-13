"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { useAuth } from "@/lib/auth-provider";

export function DashboardShell() {
  const { currentUser, isAdmin } = useAuth();

  return (
    <AppShell
      title={`Hello, ${currentUser.name}`}
      toolbar={
        <PageToolbar
          description={
            isAdmin
              ? "Team overview, pipeline health, and open work."
              : "Your deals, tasks, attendance, and recent activity."
          }
        />
      }
    >
      <DashboardView />
    </AppShell>
  );
}
