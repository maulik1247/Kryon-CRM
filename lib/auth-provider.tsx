"use client";

import * as React from "react";
import { crmClient } from "@/lib/api/crm-client";
import { isCrmApiEnabled } from "@/lib/crm-api";
import {
  notifyCreated,
  notifyDeleted,
  notifyError,
  notifyUpdated,
} from "@/lib/crm-notifications";
import { useCrmData } from "@/lib/crm-data-provider";
import type { CrmUser, UserRole } from "@/lib/types";
import {
  getRolePermissions,
  isAdminRole,
  type RolePermissions,
} from "@/lib/role-permissions";
import { DEFAULT_CURRENT_USER_ID, DEFAULT_USERS } from "./default-users";

interface AuthContextValue {
  users: CrmUser[];
  currentUser: CrmUser;
  isAdmin: boolean;
  rolePermissions: RolePermissions;
  setCurrentUserId: (userId: string) => void;
  addUser: (user: Omit<CrmUser, "id">) => void;
  updateUser: (userId: string, updates: Partial<CrmUser>) => void;
  removeUser: (userId: string) => boolean;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const apiEnabled = isCrmApiEnabled();
  const crm = useCrmData();

  const [mockUsers, setMockUsers] = React.useState(DEFAULT_USERS);
  const [mockCurrentUserId, setMockCurrentUserId] = React.useState(
    DEFAULT_CURRENT_USER_ID
  );

  const users = apiEnabled ? crm.users : mockUsers;
  const currentUser = apiEnabled
    ? crm.currentUser ?? crm.users[0] ?? mockUsers[0]
    : mockUsers.find((user) => user.id === mockCurrentUserId && user.active) ??
      mockUsers.find((user) => user.role === "admin" && user.active) ??
      mockUsers[0];

  const isAdmin = isAdminRole(currentUser.role);
  const rolePermissions = React.useMemo(
    () => getRolePermissions(currentUser.role),
    [currentUser.role]
  );

  const setCurrentUserIdSafe = React.useCallback(
    (userId: string) => {
      if (apiEnabled) return;
      const user = mockUsers.find((entry) => entry.id === userId && entry.active);
      if (user) setMockCurrentUserId(userId);
    },
    [apiEnabled, mockUsers]
  );

  const addUser = React.useCallback(
    (user: Omit<CrmUser, "id">) => {
      if (apiEnabled) {
        void crmClient
          .createUser(user)
          .then(() => crm.refreshBootstrap())
          .then(() => notifyCreated("User", user.name))
          .catch((error) =>
            notifyError("Cannot create user", error.message)
          );
        return;
      }

      const nextUser = {
        ...user,
        id: `user-${Date.now()}`,
        name: user.name.trim(),
        email: user.email.trim().toLowerCase(),
      };
      setMockUsers((prev) => [...prev, nextUser]);
      notifyCreated("User", nextUser.name);
    },
    [apiEnabled, crm]
  );

  const updateUser = React.useCallback(
    (userId: string, updates: Partial<CrmUser>) => {
      if (apiEnabled) {
        void crmClient
          .updateUser(userId, updates)
          .then(() => crm.refreshBootstrap())
          .then(() => notifyUpdated("User", updates.name ?? "User"))
          .catch((error) =>
            notifyError("Cannot update user", error.message)
          );
        return;
      }

      let updatedName: string | undefined;
      setMockUsers((prev) =>
        prev.map((user) => {
          if (user.id !== userId) return user;
          const nextRole = updates.role ?? user.role;
          const adminCount = prev.filter(
            (entry) => entry.role === "admin" && entry.active
          ).length;
          if (
            user.role === "admin" &&
            nextRole !== "admin" &&
            adminCount <= 1
          ) {
            notifyError("Cannot update user", "At least one admin is required.");
            return user;
          }
          updatedName = updates.name?.trim() ?? user.name;
          return {
            ...user,
            ...updates,
            name: updates.name?.trim() ?? user.name,
            email: updates.email?.trim().toLowerCase() ?? user.email,
            role: nextRole as UserRole,
          };
        })
      );
      if (updatedName) notifyUpdated("User", updatedName);
    },
    [apiEnabled, crm]
  );

  const removeUser = React.useCallback(
    (userId: string) => {
      if (apiEnabled) {
        void crmClient
          .deleteUser(userId)
          .then(() => crm.refreshBootstrap())
          .then(() => notifyDeleted("User"))
          .catch((error) =>
            notifyError("Cannot delete user", error.message)
          );
        return true;
      }

      const target = mockUsers.find((user) => user.id === userId);
      if (!target) return false;
      const activeAdmins = mockUsers.filter(
        (user) => user.role === "admin" && user.active && user.id !== userId
      );
      if (target.role === "admin" && activeAdmins.length === 0) {
        notifyError("Cannot delete user", "At least one admin is required.");
        return false;
      }
      setMockUsers((prev) => prev.filter((user) => user.id !== userId));
      notifyDeleted("User", target.name);
      if (mockCurrentUserId === userId) {
        const fallback =
          activeAdmins[0] ?? mockUsers.find((user) => user.id !== userId);
        if (fallback) setMockCurrentUserId(fallback.id);
      }
      return true;
    },
    [apiEnabled, crm, mockUsers, mockCurrentUserId]
  );

  const value = React.useMemo(
    () => ({
      users,
      currentUser,
      isAdmin,
      rolePermissions,
      setCurrentUserId: setCurrentUserIdSafe,
      addUser,
      updateUser,
      removeUser,
    }),
    [
      users,
      currentUser,
      isAdmin,
      rolePermissions,
      setCurrentUserIdSafe,
      addUser,
      updateUser,
      removeUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
