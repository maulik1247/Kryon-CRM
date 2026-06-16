"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { NavGroup, NavItem } from "@/lib/nav-items";
import {
  getNavGroups,
  isNavGroupActive,
  isNavItemActive,
} from "@/lib/nav-items";
import { useAuth } from "@/lib/auth-provider";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  items: NavItem[];
  collapsed?: boolean;
  nested?: boolean;
  onNavigate?: () => void;
}

interface NavGroupsProps {
  groups?: NavGroup[];
  collapsed?: boolean;
  onNavigate?: () => void;
}

function NavLinkItem({
  item,
  collapsed,
  nested,
  onNavigate,
}: {
  item: NavItem;
  collapsed?: boolean;
  nested?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = isNavItemActive(item.href, pathname);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-smooth",
        nested && !collapsed ? "px-3" : "px-3",
        nested && !collapsed && "ml-3 border-l border-sidebar-border pl-3",
        isActive
          ? "bg-sidebar-accent text-primary shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-primary"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="flex-1">{item.label}</span>}
    </Link>
  );
}

export function NavLinks({
  items,
  collapsed,
  nested,
  onNavigate,
}: NavLinksProps) {
  return (
    <>
      {items.map((item) => (
        <NavLinkItem
          key={item.href}
          item={item}
          collapsed={collapsed}
          nested={nested}
          onNavigate={onNavigate}
        />
      ))}
    </>
  );
}

export function NavGroups({
  groups: groupsProp,
  collapsed,
  onNavigate,
}: NavGroupsProps) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const groups = groupsProp ?? getNavGroups(isAdmin);
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(
    {}
  );

  React.useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const group of groups) {
        if (isNavGroupActive(group, pathname)) {
          next[group.id] = true;
        }
      }
      return next;
    });
  }, [pathname, groups]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  if (collapsed) {
    const items = groups.flatMap((group) => group.items);
    return (
      <NavLinks items={items} collapsed onNavigate={onNavigate} />
    );
  }

  return (
    <div className="space-y-1">
      {groups.map((group) => {
        const groupActive = isNavGroupActive(group, pathname);
        const isOpen = openGroups[group.id] ?? groupActive;
        const GroupIcon = group.icon;

        if (group.items.length === 1) {
          return (
            <NavLinkItem
              key={group.id}
              item={group.items[0]!}
              onNavigate={onNavigate}
            />
          );
        }

        return (
          <div key={group.id} className="space-y-0.5">
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                groupActive
                  ? "text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-primary"
              )}
            >
              <GroupIcon className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-left">{group.label}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {isOpen ? (
              <div className="space-y-0.5 pb-1">
                {group.items.map((item) => (
                  <NavLinkItem
                    key={item.href}
                    item={item}
                    nested
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
