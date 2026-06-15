"use client";

import * as React from "react";
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
import { CustomerSheet } from "./customer-sheet";
import { CustomersMobileList } from "./customers-mobile-list";
import { MobileTableScroll } from "@/components/shared/mobile-table-scroll";
import { OpenFromUrl } from "@/components/shared/open-from-url";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { useCrmData } from "@/lib/crm-data-provider";
import { downloadCustomersExcel } from "@/lib/customer-excel";
import { getVendorStatusVariant } from "@/lib/vendor-status";
import type { Customer } from "@/lib/types";

function plantLocationSummary(locations: string[]) {
  if (locations.length === 0) return "—";
  if (locations.length === 1) return locations[0];
  return `${locations.length} locations`;
}

export function CustomersTable() {
  const { customers, deleteCustomer } = useCrmData();
  const [sheetCustomer, setSheetCustomer] = React.useState<Customer | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [deleteCustomerRecord, setDeleteCustomerRecord] =
    React.useState<Customer | null>(null);
  const [deleteError, setDeleteError] = React.useState("");

  const openSheet = (customer: Customer | null) => {
    setSheetCustomer(customer);
    setSheetOpen(true);
  };

  const openSheetById = React.useCallback(
    (id: string) => {
      const customer = customers.find((entry) => entry.id === id);
      if (customer) openSheet(customer);
    },
    [customers]
  );

  const handleDeleteConfirm = () => {
    if (!deleteCustomerRecord) return;

    const removed = deleteCustomer(deleteCustomerRecord.id);
    if (!removed) {
      setDeleteError(
        "Cannot delete a customer with linked contacts or deals. Remove those first."
      );
      return;
    }

    if (sheetCustomer?.id === deleteCustomerRecord.id) {
      setSheetOpen(false);
      setSheetCustomer(null);
    }
    setDeleteCustomerRecord(null);
  };

  return (
    <>
      <React.Suspense fallback={null}>
        <OpenFromUrl
          onOpen={openSheetById}
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
            <Button onClick={() => openSheet(null)}>
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </>
        }
      />

      <div className="space-y-4">
        <CustomersMobileList
          customers={customers}
          onOpen={openSheet}
          onDelete={(customer) => {
            setDeleteError("");
            setDeleteCustomerRecord(customer);
          }}
        />

        <Card className="hidden md:block">
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
                  <TableHead className="w-[88px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer"
                    onClick={() => openSheet(customer)}
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
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <TableActions
                        onEdit={() => openSheet(customer)}
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
        </Card>
        {deleteError && (
          <p className="text-sm text-destructive">{deleteError}</p>
        )}
      </div>

      <CustomerSheet
        customer={sheetCustomer}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setSheetCustomer(null);
        }}
      />

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
