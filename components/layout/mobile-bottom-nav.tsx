"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuth } from "@/lib/auth-provider";
import { getMobileTabItems, getMoreNavGroups } from "@/lib/nav-items";
import {
  isNavGroupActive,
  isNavItemActive,
} from "@/lib/nav-items";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NavGroups } from "./nav-links";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const [moreOpen, setMoreOpen] = React.useState(false);

  const tabItems = getMobileTabItems(isAdmin);
  const moreGroups = getMoreNavGroups(isAdmin);
  const moreActive = moreGroups.some((group) =>
    isNavGroupActive(group, pathname)
  );

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-smooth md:hidden">
        <div className="grid h-16 grid-cols-5">
          {tabItems.map((item) => {
            const isActive = isNavItemActive(item.href, pathname);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition-smooth active:scale-95",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

          <Button
            type="button"
            variant="ghost"
            className={cn(
              "flex h-full flex-col items-center justify-center gap-1 rounded-none px-1 text-[10px] font-medium",
              moreActive ? "text-primary" : "text-muted-foreground"
            )}
            onClick={() => setMoreOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span>More</span>
          </Button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <nav className="mt-4">
            <NavGroups groups={moreGroups} onNavigate={() => setMoreOpen(false)} />
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
