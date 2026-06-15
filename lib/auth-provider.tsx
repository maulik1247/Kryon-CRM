"use client";

import * as React from "react";
import { DEFAULT_CURRENT_USER_ID, DEFAULT_USERS } from "./default-users";
import {
  notifyCreated,
  notifyDeleted,
  notifyError,
  notifyUpdated,
} from "./crm-notifications";
import type { CrmUser, UserRole } from "./types";
import {
  getRolePermissions,
  isAdminRole,
  type RolePermissions,
} from "./role-permissions";

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
  const [users, setUsers] = React.useState<CrmUser[]>(DEFAULT_USERS);
  const [currentUserId, setCurrentUserId] = React.useState(
    DEFAULT_CURRENT_USER_ID
  );

  const currentUser = React.useMemo(
    () =>
      users.find((user) => user.id === currentUserId && user.active) ??
      users.find((user) => user.role === "admin" && user.active) ??
      users[0],
    [users, currentUserId]
  );

  const isAdmin = isAdminRole(currentUser.role);
  const rolePermissions = React.useMemo(
    () => getRolePermissions(currentUser.role),
    [currentUser.role]
  );

  const setCurrentUserIdSafe = React.useCallback(
    (userId: string) => {
      const user = users.find((entry) => entry.id === userId && entry.active);
      if (user) {
        setCurrentUserId(userId);
      }
    },
    [users]
  );

  const addUser = React.useCallback((user: Omit<CrmUser, "id">) => {
    const nextUser = {
      ...user,
      id: `user-${Date.now()}`,
      name: user.name.trim(),
      email: user.email.trim().toLowerCase(),
    };
    setUsers((prev) => [...prev, nextUser]);
    notifyCreated("User", nextUser.name);
  }, []);

  const updateUser = React.useCallback(
    (userId: string, updates: Partial<CrmUser>) => {
      let updatedName: string | undefined;

      setUsers((prev) =>
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

      if (updatedName) {
        notifyUpdated("User", updatedName);
      }
    },
    []
  );

  const removeUser = React.useCallback(
    (userId: string) => {
      const target = users.find((user) => user.id === userId);
      if (!target) return false;

      const activeAdmins = users.filter(
        (user) => user.role === "admin" && user.active && user.id !== userId
      );
      if (target.role === "admin" && activeAdmins.length === 0) {
        notifyError("Cannot delete user", "At least one admin is required.");
        return false;
      }

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      notifyDeleted("User", target.name);

      if (currentUserId === userId) {
        const fallback =
          activeAdmins[0] ?? users.find((user) => user.id !== userId);
        if (fallback) {
          setCurrentUserId(fallback.id);
        }
      }

      return true;
    },
    [users, currentUserId]
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
