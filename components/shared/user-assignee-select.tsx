"use client";

import { FieldLabel } from "@/components/shared/field-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { canAssignDeals, getRoleLabel } from "@/lib/role-permissions";
import { useAuth } from "@/lib/auth-provider";
import { getActiveUsers } from "@/lib/user-helpers";

interface UserAssigneeSelectProps {
  value: string;
  onValueChange: (userId: string) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
  adminOnly?: boolean;
  optional?: boolean;
}

export function UserAssigneeSelect({
  value,
  onValueChange,
  label = "Assigned to",
  id = "assignee",
  disabled = false,
  adminOnly = false,
  optional = false,
}: UserAssigneeSelectProps) {
  const { users, currentUser } = useAuth();
  const canAssign = canAssignDeals(currentUser.role);
  const activeUsers = getActiveUsers(users);

  if (adminOnly && !canAssign) {
    return (
      <div className="space-y-2">
        <FieldLabel htmlFor={id} optional={optional}>
          {label}
        </FieldLabel>
        <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
          {currentUser.name}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id} optional={optional}>
        {label}
      </FieldLabel>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || (!canAssign && activeUsers.length <= 1)}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder="Select user" />
        </SelectTrigger>
        <SelectContent>
          {activeUsers.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name}
              {user.role !== "sales_rep" ? ` (${getRoleLabel(user.role)})` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
