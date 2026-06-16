"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FieldLabel } from "@/components/shared/field-label";
import { getRoleLabel } from "@/lib/role-permissions";
import { useAuth } from "@/lib/auth-provider";
import { getActiveUsers } from "@/lib/user-helpers";
import { cn } from "@/lib/utils";

interface UserMultiSelectProps {
  id?: string;
  label?: string;
  value: string[];
  onChange: (userIds: string[]) => void;
  disabled?: boolean;
  optional?: boolean;
}

export function UserMultiSelect({
  id = "user-multi-select",
  label = "Select users",
  value,
  onChange,
  disabled,
  optional = false,
}: UserMultiSelectProps) {
  const { users } = useAuth();
  const activeUsers = getActiveUsers(users);

  const toggleUser = (userId: string) => {
    if (value.includes(userId)) {
      onChange(value.filter((entry) => entry !== userId));
      return;
    }
    onChange([...value, userId]);
  };

  return (
    <div className="space-y-2">
      <FieldLabel id={id} optional={optional}>
        {label}
      </FieldLabel>
      <div className="rounded-md border bg-muted/10 p-3">
        <div className="space-y-2">
          {activeUsers.map((user) => {
            const checked = value.includes(user.id);
            return (
              <label
                key={user.id}
                htmlFor={`${id}-${user.id}`}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted/40",
                  disabled && "cursor-not-allowed opacity-60"
                )}
              >
                <Checkbox
                  id={`${id}-${user.id}`}
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={() => toggleUser(user.id)}
                />
                <span>
                  {user.name}
                  {user.role !== "sales_rep" ? (
                    <span className="text-muted-foreground">
                      {" "}
                      · {getRoleLabel(user.role)}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
