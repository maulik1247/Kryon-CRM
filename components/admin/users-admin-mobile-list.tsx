"use client";

import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DetailGrid } from "@/components/shared/detail-grid";
import {
  ExpandableMobileCard,
  useExpandableCards,
} from "@/components/shared/expandable-mobile-card";
import { getRoleLabel } from "@/lib/role-permissions";
import { UserRoleSelect } from "./user-role-select";
import type { CrmUser, UserRole } from "@/lib/types";

interface UsersAdminMobileListProps {
  users: CrmUser[];
  currentUserId: string;
  managerOptions: CrmUser[];
  onRoleChange: (userId: string, role: UserRole) => void;
  onManagerChange: (userId: string, managerId: string) => void;
  onRemove: (userId: string) => void;
}

export function UsersAdminMobileList({
  users,
  currentUserId,
  managerOptions,
  onRoleChange,
  onManagerChange,
  onRemove,
}: UsersAdminMobileListProps) {
  const { expandedId, toggleExpanded } = useExpandableCards();

  return (
    <div className="space-y-3 md:hidden">
      {users.map((user) => {
        const manager = managerOptions.find(
          (entry) => entry.id === user.reportsToUserId
        );

        return (
          <ExpandableMobileCard
            key={user.id}
            id={user.id}
            expandedId={expandedId}
            onToggle={toggleExpanded}
            summary={
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium leading-snug">
                    {user.name}
                    {user.id === currentUserId ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (you)
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <Badge variant={user.active ? "default" : "secondary"}>
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
            }
            details={
              <div className="space-y-4">
                <DetailGrid
                  items={[
                    {
                      label: "Email",
                      value: user.email,
                      className: "col-span-2",
                    },
                    {
                      label: "Manager",
                      value: manager?.name ?? "—",
                    },
                    {
                      label: "Status",
                      value: user.active ? "Active" : "Inactive",
                    },
                    {
                      label: "Role",
                      children: (
                        <UserRoleSelect
                          value={user.role}
                          onValueChange={(nextRole) =>
                            onRoleChange(user.id, nextRole)
                          }
                          className="mt-1 w-full"
                        />
                      ),
                      className: "col-span-2",
                    },
                    {
                      label: "Reports to",
                      children: (
                        <Select
                          value={user.reportsToUserId ?? "__none__"}
                          onValueChange={(value) =>
                            onManagerChange(
                              user.id,
                              value === "__none__" ? "" : value
                            )
                          }
                        >
                          <SelectTrigger className="mt-1 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">No manager</SelectItem>
                            {managerOptions
                              .filter((manager) => manager.id !== user.id)
                              .map((manager) => (
                                <SelectItem key={manager.id} value={manager.id}>
                                  {manager.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      ),
                      className: "col-span-2",
                    },
                  ]}
                />
              </div>
            }
            actions={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                disabled={user.id === currentUserId}
                onClick={() => onRemove(user.id)}
                aria-label={`Remove ${user.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            }
          />
        );
      })}
    </div>
  );
}
