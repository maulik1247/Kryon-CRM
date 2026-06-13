import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  Clock,
  Kanban,
  LayoutDashboard,
  ListTodo,
  Package,
  ScrollText,
  Shield,
  Users,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  mobileTab?: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    items: [
      {
        href: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
        mobileTab: true,
      },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    icon: Kanban,
    items: [
      {
        href: "/deal-pipeline",
        label: "Deals",
        icon: Kanban,
        mobileTab: true,
      },
      { href: "/tasks", label: "Tasks", icon: ListTodo },
      { href: "/activity-log", label: "Activity", icon: ScrollText },
    ],
  },
  {
    id: "master-data",
    label: "Master Data",
    icon: Building2,
    items: [
      {
        href: "/customers",
        label: "Customers",
        icon: Building2,
        mobileTab: true,
      },
      { href: "/contacts", label: "Contacts", icon: Users, mobileTab: true },
      { href: "/products", label: "Products", icon: Package },
    ],
  },
  {
    id: "workplace",
    label: "Workplace",
    icon: Clock,
    items: [
      { href: "/attendance", label: "Attendance", icon: Clock },
      { href: "/reminders", label: "Reminders", icon: Bell },
    ],
  },
  {
    id: "admin",
    label: "Administration",
    icon: Shield,
    adminOnly: true,
    items: [{ href: "/admin", label: "Admin", icon: Shield }],
  },
];

/** @deprecated Use getNavGroups — kept for flat consumers */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

export function getNavGroups(isAdmin: boolean): NavGroup[] {
  return NAV_GROUPS.filter((group) => !group.adminOnly || isAdmin).map(
    (group) => ({
      ...group,
      items: group.items.filter((item) => !item.adminOnly || isAdmin),
    })
  );
}

export function getNavItems(isAdmin: boolean) {
  return getNavGroups(isAdmin).flatMap((group) => group.items);
}

export function getMobileTabItems(isAdmin: boolean) {
  return getNavItems(isAdmin).filter((item) => item.mobileTab);
}

export function getMoreNavItems(isAdmin: boolean) {
  return getNavItems(isAdmin).filter((item) => !item.mobileTab);
}

export function getMoreNavGroups(isAdmin: boolean): NavGroup[] {
  return getNavGroups(isAdmin)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.mobileTab),
    }))
    .filter((group) => group.items.length > 0);
}

export function isNavItemActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function isNavGroupActive(group: NavGroup, pathname: string) {
  return group.items.some((item) => isNavItemActive(item.href, pathname));
}
