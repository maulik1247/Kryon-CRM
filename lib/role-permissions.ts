import type { UserRole } from "@/lib/types";

export type DealViewScope = "own" | "team" | "all" | "none";

export interface RolePermissions {
  label: string;
  canCreate: string;
  canView: string;
  canApprove: string;
  dashboardAccess: string;
  dealViewScope: DealViewScope;
  canAccessMasterData: boolean;
  canManageUsers: boolean;
  canAssignDeals: boolean;
  maxDiscountApprovalPercent?: number;
  canApprovePfi: boolean;
  canApprovePfiFinal: boolean;
}

export const USER_ROLES: UserRole[] = [
  "sales_rep",
  "sales_manager",
  "commercial_manager",
  "vp_director",
  "rnd",
  "quality",
  "finance",
  "admin",
];

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  sales_rep: {
    label: "Sales Rep",
    canCreate: "Leads, Deals, Visits, Quotes",
    canView: "Own deals only",
    canApprove: "No",
    dashboardAccess: "Own pipeline",
    dealViewScope: "own",
    canAccessMasterData: false,
    canManageUsers: false,
    canAssignDeals: false,
    canApprovePfi: false,
    canApprovePfiFinal: false,
  },
  sales_manager: {
    label: "Sales Manager",
    canCreate: "All + assign deals",
    canView: "Team deals",
    canApprove: "Quotes, Discounts ≤ 15%",
    dashboardAccess: "Team pipeline",
    dealViewScope: "team",
    canAccessMasterData: false,
    canManageUsers: false,
    canAssignDeals: true,
    maxDiscountApprovalPercent: 15,
    canApprovePfi: false,
    canApprovePfiFinal: false,
  },
  commercial_manager: {
    label: "Commercial Mgr",
    canCreate: "Quotes, PFI",
    canView: "All deals + pricing",
    canApprove: "PFI review, Disc ≤ 25%",
    dashboardAccess: "Full pipeline + pricing",
    dealViewScope: "all",
    canAccessMasterData: false,
    canManageUsers: false,
    canAssignDeals: true,
    maxDiscountApprovalPercent: 25,
    canApprovePfi: true,
    canApprovePfiFinal: false,
  },
  vp_director: {
    label: "VP / Director",
    canCreate: "—",
    canView: "All",
    canApprove: "PFI final, Disc > 25%",
    dashboardAccess: "Full + strategy",
    dealViewScope: "all",
    canAccessMasterData: false,
    canManageUsers: false,
    canAssignDeals: true,
    canApprovePfi: true,
    canApprovePfiFinal: true,
  },
  rnd: {
    label: "R&D",
    canCreate: "Sample feedback, test results",
    canView: "Assigned samples",
    canApprove: "No",
    dashboardAccess: "Sample tracker",
    dealViewScope: "none",
    canAccessMasterData: false,
    canManageUsers: false,
    canAssignDeals: false,
    canApprovePfi: false,
    canApprovePfiFinal: false,
  },
  quality: {
    label: "Quality",
    canCreate: "Test reports, readiness items",
    canView: "Quality items",
    canApprove: "No",
    dashboardAccess: "Quality dashboard",
    dealViewScope: "none",
    canAccessMasterData: false,
    canManageUsers: false,
    canAssignDeals: false,
    canApprovePfi: false,
    canApprovePfiFinal: false,
  },
  finance: {
    label: "Finance",
    canCreate: "PO, Invoices, Payments",
    canView: "PO + payment data",
    canApprove: "No",
    dashboardAccess: "Revenue dashboard",
    dealViewScope: "none",
    canAccessMasterData: false,
    canManageUsers: false,
    canAssignDeals: false,
    canApprovePfi: false,
    canApprovePfiFinal: false,
  },
  admin: {
    label: "Admin",
    canCreate: "All masters, users, config",
    canView: "Everything",
    canApprove: "System config",
    dashboardAccess: "All dashboards",
    dealViewScope: "all",
    canAccessMasterData: true,
    canManageUsers: true,
    canAssignDeals: true,
    canApprovePfi: true,
    canApprovePfiFinal: true,
  },
};

export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

export function getRoleLabel(role: UserRole): string {
  return ROLE_PERMISSIONS[role].label;
}

export function isAdminRole(role: UserRole): boolean {
  return role === "admin";
}

export function canAccessMasterData(role: UserRole): boolean {
  return getRolePermissions(role).canAccessMasterData;
}

export function canAssignDeals(role: UserRole): boolean {
  return getRolePermissions(role).canAssignDeals;
}

export function canViewAllDeals(role: UserRole): boolean {
  const scope = getRolePermissions(role).dealViewScope;
  return scope === "all";
}

export function getTeamMemberNames(
  manager: { id: string; name: string },
  users: { id: string; name: string; reportsToUserId?: string; active: boolean }[]
): Set<string> {
  const names = new Set<string>();
  for (const user of users) {
    if (!user.active) continue;
    if (user.reportsToUserId === manager.id) {
      names.add(user.name);
    }
  }
  return names;
}

export function getDealOwnersVisibleToUser(
  currentUser: { id: string; name: string; role: UserRole },
  users: { id: string; name: string; reportsToUserId?: string; active: boolean }[]
): Set<string> | "all" | "none" {
  const scope = getRolePermissions(currentUser.role).dealViewScope;

  switch (scope) {
    case "all":
      return "all";
    case "none":
      return "none";
    case "own":
      return new Set([currentUser.name]);
    case "team": {
      const team = getTeamMemberNames(currentUser, users);
      team.add(currentUser.name);
      return team;
    }
  }
}
