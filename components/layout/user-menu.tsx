"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getRoleLabel } from "@/lib/role-permissions";
import { useAuth } from "@/lib/auth-provider";
import { isCrmApiEnabled } from "@/lib/crm-api";
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
  collapsed?: boolean;
  className?: string;
}

export function UserMenu({ collapsed = false, className }: UserMenuProps) {
  const { currentUser } = useAuth();
  const clerkEnabled = isCrmApiEnabled();
  const roleLabel = getRoleLabel(currentUser.role);

  if (!clerkEnabled) {
    return (
      <UserMenuButton
        currentUser={currentUser}
        roleLabel={roleLabel}
        collapsed={collapsed}
        className={className}
      />
    );
  }

  return (
    <ClerkUserMenu
      currentUser={currentUser}
      roleLabel={roleLabel}
      collapsed={collapsed}
      className={className}
    />
  );
}

function UserMenuButton({
  currentUser,
  roleLabel,
  displayImage,
  collapsed,
  className,
  buttonRef,
  onClick,
  "aria-expanded": ariaExpanded,
}: {
  currentUser: { name: string };
  roleLabel: string;
  displayImage?: string;
  collapsed: boolean;
  className?: string;
  buttonRef?: React.Ref<HTMLButtonElement>;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  "aria-expanded"?: boolean;
}) {
  return (
    <Button
      ref={buttonRef}
      type="button"
      variant="ghost"
      aria-label={`${currentUser.name} account menu`}
      aria-haspopup="menu"
      aria-expanded={ariaExpanded}
      onClick={onClick}
      className={cn(
        "pointer-events-auto h-auto min-h-9 w-full items-center gap-2 rounded-lg px-2 py-1.5",
        collapsed && "w-auto justify-center px-0",
        className
      )}
    >
      <Avatar
        className={cn(
          "h-8 w-8 shrink-0 ring-2 ring-border/60",
          collapsed && "h-9 w-9"
        )}
      >
        {displayImage ? (
          <AvatarImage src={displayImage} alt={currentUser.name} />
        ) : null}
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {initials(currentUser.name)}
        </AvatarFallback>
      </Avatar>
      {!collapsed && (
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
          <span className="truncate text-sm font-medium leading-none">
            {currentUser.name}
          </span>
          <span className="truncate text-xs leading-none text-muted-foreground">
            {roleLabel}
          </span>
        </div>
      )}
    </Button>
  );
}

function ClerkUserMenu({
  currentUser,
  roleLabel,
  collapsed,
  className,
}: {
  currentUser: { name: string; email: string };
  roleLabel: string;
  collapsed: boolean;
  className?: string;
}) {
  const clerk = useClerk();
  const { user: clerkUser } = useUser();
  const [open, setOpen] = React.useState(false);
  const [menuStyle, setMenuStyle] = React.useState<React.CSSProperties>({});
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const displayEmail =
    clerkUser?.primaryEmailAddress?.emailAddress ?? currentUser.email;
  const displayImage = clerkUser?.imageUrl;

  const updateMenuPosition = React.useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const menuWidth = 256;
    const gap = 8;
    const left = Math.min(
      Math.max(12, rect.left),
      window.innerWidth - menuWidth - 12
    );
    const bottom = window.innerHeight - rect.top + gap;

    setMenuStyle({
      position: "fixed",
      left,
      bottom,
      width: menuWidth,
      zIndex: 300,
    });
  }, []);

  const toggleOpen = () => {
    setOpen((value) => {
      const next = !value;
      if (next) {
        requestAnimationFrame(updateMenuPosition);
      }
      return next;
    });
  };

  React.useEffect(() => {
    if (!open) return;

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open, updateMenuPosition]);

  const handleSignOut = () => {
    setOpen(false);
    void clerk.signOut({ redirectUrl: "/sign-in" });
  };

  const menu =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={menuStyle}
            className="overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg"
          >
            <div className="flex items-start gap-3 p-3">
              <Avatar className="h-10 w-10 shrink-0 ring-2 ring-border/60">
                {displayImage ? (
                  <AvatarImage src={displayImage} alt={currentUser.name} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  {initials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-sm font-semibold leading-none">
                  {currentUser.name}
                </p>
                {displayEmail ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {displayEmail}
                  </p>
                ) : null}
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 text-[10px] font-medium"
                >
                  {roleLabel}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="p-1">
              <button
                type="button"
                role="menuitem"
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <UserMenuButton
        buttonRef={buttonRef}
        currentUser={currentUser}
        roleLabel={roleLabel}
        displayImage={displayImage}
        collapsed={collapsed}
        className={className}
        aria-expanded={open}
        onClick={toggleOpen}
      />
      {menu}
    </>
  );
}
