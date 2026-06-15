"use client";

import { ChevronDown, Shield, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRoleLabel, isAdminRole } from "@/lib/role-permissions";
import { useAuth } from "@/lib/auth-provider";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface UserMenuProps {
  variant?: "header" | "sidebar";
  collapsed?: boolean;
}

export function UserMenu({ variant = "header", collapsed = false }: UserMenuProps) {
  const { users, currentUser, isAdmin, setCurrentUserId } = useAuth();
  const activeUsers = users.filter((user) => user.active);
  const isSidebar = variant === "sidebar";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto min-h-9 items-center gap-2 rounded-lg px-2 py-1.5",
            isSidebar && "w-full",
            isSidebar && collapsed && "justify-center px-0"
          )}
        >
          <Avatar
            className={cn("h-8 w-8 shrink-0", isSidebar && collapsed && "h-9 w-9")}
          >
            <AvatarFallback className="bg-muted text-xs font-medium">
              {initials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
          {(!isSidebar || !collapsed) && (
            <div
              className={cn(
                "min-w-0 flex-col gap-0.5 text-left",
                isSidebar ? "flex flex-1" : "hidden sm:flex"
              )}
            >
              <span className="truncate text-sm font-medium leading-none">
                {currentUser.name}
              </span>
              <span className="truncate text-xs leading-none text-muted-foreground">
                {getRoleLabel(currentUser.role)}
              </span>
            </div>
          )}
          {(!isSidebar || !collapsed) && (
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground",
                isSidebar ? "ml-auto" : "hidden sm:block"
              )}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isSidebar ? "start" : "end"}
        side={isSidebar ? "top" : "bottom"}
        className="w-56"
      >
        <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
        <DropdownMenuItem disabled className="flex flex-col items-start">
          <span>{currentUser.name}</span>
          <span className="text-xs text-muted-foreground">
            {currentUser.email}
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Switch user</DropdownMenuLabel>
        {activeUsers.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => setCurrentUserId(user.id)}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              {isAdminRole(user.role) ? (
                <Shield className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
              {user.name}
            </span>
            {user.id === currentUser.id && (
              <Badge variant="secondary" className="text-[10px]">
                Active
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
