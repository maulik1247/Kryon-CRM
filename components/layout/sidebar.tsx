"use client";

import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-provider";
import { getNavGroups } from "@/lib/nav-items";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/layout/user-menu";
import { NavGroups } from "./nav-links";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { isAdmin } = useAuth();
  const navGroups = getNavGroups(isAdmin);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-smooth-out md:flex",
        collapsed ? "w-[68px]" : "w-60"
      )}
    >
      <div
        className={cn(
          "flex shrink-0 border-b border-sidebar-border",
          collapsed
            ? "flex-col items-center gap-2 px-2 py-3"
            : "h-14 items-center justify-between px-3"
        )}
      >
        <div
          className={cn(
            "flex min-w-0 items-center gap-2",
            collapsed && "justify-center"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          {!collapsed && (
            <span className="font-display text-sm font-semibold tracking-[0.18em] text-primary">
              KRYON
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 shrink-0 text-muted-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <NavGroups groups={navGroups} collapsed={collapsed} />
      </nav>

      <Separator />
      <div className={cn("relative z-20 shrink-0 p-3", collapsed && "px-2")}>
        <UserMenu collapsed={collapsed} />
      </div>
    </aside>
  );
}
