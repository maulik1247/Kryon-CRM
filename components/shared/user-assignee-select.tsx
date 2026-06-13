"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-provider";
import { getActiveUsers } from "@/lib/user-helpers";

interface UserAssigneeSelectProps {
  value: string;
  onValueChange: (userId: string) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
  adminOnly?: boolean;
}

export function UserAssigneeSelect({
  value,
  onValueChange,
  label = "Assigned to",
  id = "assignee",
  disabled = false,
  adminOnly = false,
}: UserAssigneeSelectProps) {
  const { users, currentUser, isAdmin } = useAuth();
  const activeUsers = getActiveUsers(users);

  if (adminOnly && !isAdmin) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
          {currentUser.name}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || (!isAdmin && activeUsers.length <= 1)}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder="Select user" />
        </SelectTrigger>
        <SelectContent>
          {activeUsers.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name}
              {user.role === "admin" ? " (Admin)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
