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
import { useAuth } from "@/lib/auth-provider";
import { MobileTableScroll } from "@/components/shared/mobile-table-scroll";
import { UsersAdminMobileList } from "./users-admin-mobile-list";
import type { UserRole } from "@/lib/types";

export function UsersAdminTable() {
  const { users, currentUser, addUser, updateUser, removeUser } = useAuth();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("sales");
  const [error, setError] = React.useState("");

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
    });
    setName("");
    setEmail("");
    setRole("sales");
  };

  const handleRemove = (userId: string) => {
    setError("");
    const removed = removeUser(userId);
    if (!removed) {
      setError("Cannot remove the last active admin.");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-base">Users & Access</CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage who can use Kryon CRM and who has admin access to this page.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={handleAdd}
          className="grid gap-3 rounded-md border p-4 sm:grid-cols-4"
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
          <Select
            value={role}
            onValueChange={(value) => setRole(value as UserRole)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit">
            <Plus className="h-4 w-4" />
            Add user
          </Button>
        </form>

        <UsersAdminMobileList
          users={users}
          currentUserId={currentUser.id}
          onRoleChange={(userId, role) => updateUser(userId, { role })}
          onRemove={handleRemove}
        />

        <div className="hidden md:block">
          <MobileTableScroll>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[88px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
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
                      <Select
                        value={user.role}
                        onValueChange={(value) =>
                          updateUser(user.id, { role: value as UserRole })
                        }
                      >
                        <SelectTrigger className="h-8 w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
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
                        onClick={() => handleRemove(user.id)}
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
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
