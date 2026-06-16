"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileTableScroll } from "@/components/shared/mobile-table-scroll";
import { TablePagination } from "@/components/shared/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { getRoleLabel, ROLE_PERMISSIONS, USER_ROLES } from "@/lib/role-permissions";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RolePermissionsMatrixProps {
  highlightRole?: UserRole;
}

export function RolePermissionsMatrix({
  highlightRole,
}: RolePermissionsMatrixProps) {
  const {
    paginatedItems,
    page,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    setPage,
  } = usePagination(USER_ROLES);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-base">
          Roles & Permissions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Reference matrix for what each role can create, view, approve, and
          access on dashboards.
        </p>
      </CardHeader>
      <CardContent>
        <MobileTableScroll>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Can Create</TableHead>
                <TableHead>Can View</TableHead>
                <TableHead>Can Approve</TableHead>
                <TableHead>Dashboard Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((role) => {
                const permissions = ROLE_PERMISSIONS[role];
                const highlighted = highlightRole === role;

                return (
                  <TableRow
                    key={role}
                    className={cn(
                      highlighted && "bg-muted/50"
                    )}
                  >
                    <TableCell className="whitespace-nowrap font-medium">
                      {getRoleLabel(role)}
                    </TableCell>
                    <TableCell className="min-w-[160px] text-muted-foreground">
                      {permissions.canCreate}
                    </TableCell>
                    <TableCell className="min-w-[140px] text-muted-foreground">
                      {permissions.canView}
                    </TableCell>
                    <TableCell className="min-w-[140px] text-muted-foreground">
                      {permissions.canApprove}
                    </TableCell>
                    <TableCell className="min-w-[140px] text-muted-foreground">
                      {permissions.dashboardAccess}
                    </TableCell>
                  </TableRow>
                );
              })}
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
      </CardContent>
    </Card>
  );
}
