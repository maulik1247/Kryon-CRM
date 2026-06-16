"use client";

import * as React from "react";
import { Factory, Plus } from "lucide-react";
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
import { Card } from "@/components/ui/card";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { TableActions } from "@/components/shared/table-actions";
import { MobileTableScroll } from "@/components/shared/mobile-table-scroll";
import { OpenFromUrl } from "@/components/shared/open-from-url";
import { EmptyState } from "@/components/shared/empty-state";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { TablePagination } from "@/components/shared/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useRecordNavigation } from "@/hooks/use-record-navigation";
import { useAuth } from "@/lib/auth-provider";
import Link from "next/link";
import { SuppliersMobileList } from "./suppliers-mobile-list";
import { useCrmData } from "@/lib/crm-data-provider";
import { sortByCreatedAtDesc } from "@/lib/list-helpers";
import { recordNewRoutes, recordRoutes } from "@/lib/record-routes";
import { getUserName } from "@/lib/user-helpers";
import type { Supplier } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function SuppliersTable() {
  const { users } = useAuth();
  const { suppliers, deleteSupplier } = useCrmData();
  const { goToSupplier } = useRecordNavigation();
  const [deleteSupplierRecord, setDeleteSupplierRecord] =
    React.useState<Supplier | null>(null);
  const [deleteError, setDeleteError] = React.useState("");

  const sortedSuppliers = React.useMemo(
    () => sortByCreatedAtDesc(suppliers),
    [suppliers]
  );

  const {
    paginatedItems,
    page,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    setPage,
  } = usePagination(sortedSuppliers);

  const handleDeleteConfirm = () => {
    if (!deleteSupplierRecord) return;

    const removed = deleteSupplier(deleteSupplierRecord.id);
    if (!removed) {
      setDeleteError(
        "Cannot delete a supplier linked to customer products. Remove links first."
      );
      return;
    }

    setDeleteSupplierRecord(null);
  };

  return (
    <>
      <React.Suspense fallback={null}>
        <OpenFromUrl
          getHref={recordRoutes.supplier}
          canOpen={(id) => suppliers.some((entry) => entry.id === id)}
        />
      </React.Suspense>

      <PageToolbar
        description="Competitor suppliers — linked to customer product details for market intelligence."
        meta={
          <span>
            <span className="font-medium text-foreground">{suppliers.length}</span>{" "}
            {suppliers.length === 1 ? "supplier" : "suppliers"}
          </span>
        }
        actions={
          <Button asChild>
            <Link href={recordNewRoutes.supplier}>
              <Plus className="h-4 w-4" />
              Add Supplier
            </Link>
          </Button>
        }
      />

      <div className="space-y-4">
        {suppliers.length === 0 ? (
          <div className="md:hidden">
            <EmptyState
              icon={Factory}
              title="No suppliers yet"
              description="Add competitor suppliers to track who customers buy from today."
              action={
                <Button asChild>
                  <Link href={recordNewRoutes.supplier}>
                    <Plus className="h-4 w-4" />
                    Add Supplier
                  </Link>
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <SuppliersMobileList
              suppliers={paginatedItems}
              users={users}
              onOpen={(supplier) => goToSupplier(supplier.id)}
              onDelete={(supplier) => {
                setDeleteError("");
                setDeleteSupplierRecord(supplier);
              }}
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
          </>
        )}

        <Card className="hidden overflow-hidden shadow-sm md:block">
          <MobileTableScroll>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Added on</TableHead>
                  <TableHead>Added by</TableHead>
                  <TableHead className="w-[88px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="p-0">
                      <EmptyState
                        icon={Factory}
                        title="No suppliers yet"
                        description="Add competitor suppliers to track who customers buy from today."
                        action={
                          <Button asChild>
                            <Link href={recordNewRoutes.supplier}>
                              <Plus className="h-4 w-4" />
                              Add Supplier
                            </Link>
                          </Button>
                        }
                        className="m-4 border-none bg-transparent shadow-none"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((supplier) => (
                    <TableRow
                      key={supplier.id}
                      className="cursor-pointer"
                      onClick={() => goToSupplier(supplier.id)}
                    >
                      <TableCell className="max-w-[200px] truncate font-medium">
                        {supplier.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{supplier.type}</Badge>
                      </TableCell>
                      <TableCell>{supplier.region}</TableCell>
                      <TableCell className="max-w-[240px] truncate text-muted-foreground">
                        {supplier.notes ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(supplier.createdAt)}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate">
                        {getUserName(users, supplier.createdByUserId)}
                      </TableCell>
                      <TableCell>
                        <TableActions
                          onEdit={() => goToSupplier(supplier.id)}
                          onDelete={() => {
                            setDeleteError("");
                            setDeleteSupplierRecord(supplier);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
        </Card>
        {deleteError ? (
          <p className="text-sm text-destructive">{deleteError}</p>
        ) : null}
      </div>

      <DeleteConfirmDialog
        open={!!deleteSupplierRecord}
        onOpenChange={(open) => {
          if (!open) setDeleteSupplierRecord(null);
        }}
        title="Delete supplier?"
        description={`This will permanently remove ${deleteSupplierRecord?.name ?? "this supplier"}.`}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
