"use client";

import { Zap } from "lucide-react";
import { RemindersMenu } from "@/components/layout/reminders-menu";
import { GlobalSearch } from "@/components/layout/global-search";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md transition-smooth supports-[backdrop-filter]:bg-background/70 md:px-6">
      <div className="flex min-h-10 items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground md:hidden">
            <Zap className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            {title ? (
              <h1 className="truncate font-display text-base font-semibold leading-tight tracking-tight sm:text-lg">
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <GlobalSearch />
          <ThemeToggle />
          <RemindersMenu />
          <UserMenu
            collapsed
            className="h-9 w-9 justify-center p-0 md:hidden"
          />
        </div>
      </div>
    </header>
  );
}
