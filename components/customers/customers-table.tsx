"use client";

import * as React from "react";
import Link from "next/link";
import { Download, Plus } from "lucide-react";
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
import { PriorityBadge } from "@/components/shared/priority-badge";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { TableActions } from "@/components/shared/table-actions";
import { CustomersMobileList } from "./customers-mobile-list";
import { MobileTableScroll } from "@/components/shared/mobile-table-scroll";
import { OpenFromUrl } from "@/components/shared/open-from-url";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { TablePagination } from "@/components/shared/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { downloadCustomersExcel } from "@/lib/customer-excel";
import { sortByCreatedAtDesc } from "@/lib/list-helpers";
import { recordNewRoutes, recordRoutes } from "@/lib/record-routes";
import { getVendorStatusVariant } from "@/lib/vendor-status";
import { useRecordNavigation } from "@/hooks/use-record-navigation";
import { getUserName } from "@/lib/user-helpers";
import type { Customer } from "@/lib/types";
import { formatDate } from "@/lib/utils";

function plantLocationSummary(locations: string[]) {
  if (locations.length === 0) return "—";
  if (locations.length === 1) return locations[0];
  return `${locations.length} locations`;
}

export function CustomersTable() {
  const { users } = useAuth();
  const { customers, deleteCustomer } = useCrmData();
  const { goToCustomer } = useRecordNavigation();
  const [deleteCustomerRecord, setDeleteCustomerRecord] =
    React.useState<Customer | null>(null);
  const [deleteError, setDeleteError] = React.useState("");

  const sortedCustomers = React.useMemo(
    () => sortByCreatedAtDesc(customers),
    [customers]
  );

  const {
    paginatedItems,
    page,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    setPage,
  } = usePagination(sortedCustomers);

  const handleDeleteConfirm = () => {
    if (!deleteCustomerRecord) return;

    const removed = deleteCustomer(deleteCustomerRecord.id);
    if (!removed) {
      setDeleteError(
        "Cannot delete a customer with linked contacts or deals. Remove those first."
      );
      return;
    }

    setDeleteCustomerRecord(null);
  };

  return (
    <>
      <React.Suspense fallback={null}>
        <OpenFromUrl
          getHref={recordRoutes.customer}
          canOpen={(id) => customers.some((entry) => entry.id === id)}
        />
      </React.Suspense>

      <PageToolbar
        description="Central record for each OEM customer with full company profile."
        meta={
          <span>
            <span className="font-medium text-foreground">
              {customers.length}
            </span>{" "}
            {customers.length === 1 ? "customer" : "customers"}
          </span>
        }
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => downloadCustomersExcel(customers)}
            >
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
            <Button asChild>
              <Link href={recordNewRoutes.customer}>
                <Plus className="h-4 w-4" />
                Add Customer
              </Link>
            </Button>
          </>
        }
      />

      <div className="space-y-4">
        <CustomersMobileList
          customers={paginatedItems}
          users={users}
          onOpen={(customer) => goToCustomer(customer.id)}
          onDelete={(customer) => {
            setDeleteError("");
            setDeleteCustomerRecord(customer);
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

        <Card className="hidden overflow-hidden md:block">
          <MobileTableScroll>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>OEM Segment</TableHead>
                  <TableHead>Lead Source</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Account Owner</TableHead>
                  <TableHead>Plant Location(s)</TableHead>
                  <TableHead>Vendor Status</TableHead>
                  <TableHead>Added on</TableHead>
                  <TableHead>Added by</TableHead>
                  <TableHead className="w-[88px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer"
                    onClick={() => goToCustomer(customer.id)}
                  >
                    <TableCell className="max-w-[200px] truncate font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate">
                      {customer.oemSegment}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate">
                      {customer.leadSource}
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={customer.priority} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{customer.tier}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate">
                      {customer.accountOwner}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-muted-foreground">
                      {plantLocationSummary(customer.plantLocations)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getVendorStatusVariant(customer.vendorStatus)}
                      >
                        {customer.vendorStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(customer.createdAt)}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate">
                      {getUserName(users, customer.createdByUserId)}
                    </TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <TableActions
                        onEdit={() => goToCustomer(customer.id)}
                        onDelete={() => {
                          setDeleteError("");
                          setDeleteCustomerRecord(customer);
                        }}
                      />
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
        </Card>
        {deleteError && (
          <p className="text-sm text-destructive">{deleteError}</p>
        )}
      </div>

      <DeleteConfirmDialog
        open={!!deleteCustomerRecord}
        onOpenChange={(open) => {
          if (!open) setDeleteCustomerRecord(null);
        }}
        title="Delete customer?"
        description={`This will permanently remove ${deleteCustomerRecord?.name ?? "this customer"}.`}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
