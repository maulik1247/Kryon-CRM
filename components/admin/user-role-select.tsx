"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRoleLabel, USER_ROLES } from "@/lib/role-permissions";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

interface UserRoleSelectProps {
  value: UserRole;
  onValueChange: (role: UserRole) => void;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export function UserRoleSelect({
  value,
  onValueChange,
  className,
  triggerClassName,
  disabled,
}: UserRoleSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onValueChange(next as UserRole)}
      disabled={disabled}
    >
      <SelectTrigger className={cn("h-9", triggerClassName, className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {USER_ROLES.map((role) => (
          <SelectItem key={role} value={role}>
            {getRoleLabel(role)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
