"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-provider";
import { MobileTableScroll } from "@/components/shared/mobile-table-scroll";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { TablePagination } from "@/components/shared/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { getRoleLabel } from "@/lib/role-permissions";
import { getManagerOptions } from "@/lib/user-helpers";
import { UsersAdminMobileList } from "./users-admin-mobile-list";
import { UserRoleSelect } from "./user-role-select";
import { RolePermissionsMatrix } from "./role-permissions-matrix";
import type { CrmUser, UserRole } from "@/lib/types";

export function UsersAdminTable() {
  const { users, currentUser, addUser, updateUser, removeUser } = useAuth();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("sales_rep");
  const [reportsToUserId, setReportsToUserId] = React.useState("");
  const [error, setError] = React.useState("");
  const [userToDelete, setUserToDelete] = React.useState<CrmUser | null>(null);

  const managerOptions = React.useMemo(
    () => getManagerOptions(users),
    [users]
  );

  const {
    paginatedItems,
    page,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    setPage,
  } = usePagination(users);

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }

    const duplicate = users.some(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (duplicate) {
      setError("A user with this email already exists.");
      return;
    }

    addUser({
      name: name.trim(),
      email: email.trim(),
      role,
      active: true,
      reportsToUserId: reportsToUserId || undefined,
    });
    setName("");
    setEmail("");
    setRole("sales_rep");
    setReportsToUserId("");
  };

  const openDeleteDialog = (userId: string) => {
    const target = users.find((user) => user.id === userId);
    if (target) setUserToDelete(target);
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    setError("");
    const removed = removeUser(userToDelete.id);
    if (!removed) {
      setError("Cannot remove the last active admin.");
    }
    setUserToDelete(null);
  };

  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid h-auto w-full grid-cols-2">
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="mt-4 space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">Users & Access</CardTitle>
          <p className="text-sm text-muted-foreground">
            Assign roles and reporting lines. Permissions follow the matrix
            below.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={handleAdd}
            className="grid gap-3 rounded-md border p-4 lg:grid-cols-5"
          >
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
            />
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
            />
            <UserRoleSelect value={role} onValueChange={setRole} />
            <Select
              value={reportsToUserId || "__none__"}
              onValueChange={(value) =>
                setReportsToUserId(value === "__none__" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Reports to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No manager</SelectItem>
                {managerOptions.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id}>
                    {manager.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">
              <Plus className="h-4 w-4" />
              Add user
            </Button>
          </form>

          <UsersAdminMobileList
            users={paginatedItems}
            currentUserId={currentUser.id}
            managerOptions={managerOptions}
            onRoleChange={(userId, nextRole) =>
              updateUser(userId, { role: nextRole })
            }
            onManagerChange={(userId, managerId) =>
              updateUser(userId, {
                reportsToUserId: managerId || undefined,
              })
            }
            onRemove={openDeleteDialog}
          />
          {totalItems > 0 ? (
            <div className="overflow-hidden rounded-lg border bg-card shadow-sm md:hidden">
              <TablePagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                onPageChange={setPage}
              />
            </div>
          ) : null}

          <div className="hidden overflow-hidden md:block">
            <MobileTableScroll>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Reports to</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[88px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name}
                        {user.id === currentUser.id && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <UserRoleSelect
                          value={user.role}
                          onValueChange={(nextRole) =>
                            updateUser(user.id, { role: nextRole })
                          }
                          triggerClassName="h-8 w-[160px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.reportsToUserId ?? "__none__"}
                          onValueChange={(value) =>
                            updateUser(user.id, {
                              reportsToUserId:
                                value === "__none__" ? undefined : value,
                            })
                          }
                        >
                          <SelectTrigger className="h-8 w-[160px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">—</SelectItem>
                            {managerOptions
                              .filter((manager) => manager.id !== user.id)
                              .map((manager) => (
                                <SelectItem key={manager.id} value={manager.id}>
                                  {manager.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.active ? "default" : "secondary"}>
                          {user.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          disabled={user.id === currentUser.id}
                          onClick={() => openDeleteDialog(user.id)}
                          aria-label={`Remove ${user.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </MobileTableScroll>
            {totalItems > 0 ? (
              <TablePagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                onPageChange={setPage}
              />
            ) : null}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="permissions" className="mt-4">
        <RolePermissionsMatrix />
      </TabsContent>

      <DeleteConfirmDialog
        open={!!userToDelete}
        onOpenChange={(open) => {
          if (!open) setUserToDelete(null);
        }}
        title="Delete user?"
        description={`This will permanently remove ${userToDelete?.name ?? "this user"} and revoke their CRM access.`}
        onConfirm={handleDeleteConfirm}
      />
    </Tabs>
  );
}
