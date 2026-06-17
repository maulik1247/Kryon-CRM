"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { UserMenu } from "./user-menu";
import { PageTransition } from "./page-transition";
import { useReminderUserToast } from "@/components/reminders/use-reminder-user-toast";
import { cn } from "@/lib/utils";

function ReminderUserToast() {
  useReminderUserToast();
  return null;
}

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  toolbar?: React.ReactNode;
}

export function AppShell({ children, title, subtitle, toolbar }: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <ReminderUserToast />
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col transition-[margin] duration-300 ease-smooth-out",
          "ml-0 md:ml-60",
          collapsed && "md:ml-[68px]"
        )}
      >
        <Header title={title} subtitle={subtitle} />
        <main className="w-full min-w-0 flex-1 px-4 py-4 pb-24 md:p-6 md:pb-6">
          <PageTransition>
            <div className="space-y-6">
              {toolbar}
              {children}
            </div>
          </PageTransition>
        </main>
      </div>
      <MobileBottomNav />
      <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] left-3 z-50 md:hidden">
        <div className="rounded-xl border bg-card p-1 shadow-md">
          <UserMenu collapsed />
        </div>
      </div>
    </div>
  );
}
