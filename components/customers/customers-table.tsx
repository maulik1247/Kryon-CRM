"use client";

import * as React from "react";
import { ChevronRight, Download, Plus, Upload } from "lucide-react";
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
import { CustomerExpandedDetails } from "./customer-expanded-details";
import { CustomersMobileList } from "./customers-mobile-list";
import { MobileTableScroll } from "@/components/shared/mobile-table-scroll";
import { OpenFromUrl } from "@/components/shared/open-from-url";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { useCrmData } from "@/lib/crm-data-provider";
import {
  downloadCustomersExcel,
  parseCustomersExcelFile,
} from "@/lib/customer-excel";
import { notifyError, notifyInfo } from "@/lib/crm-notifications";
import { getVendorStatusVariant } from "@/lib/vendor-status";
import { cn } from "@/lib/utils";
import type { Customer } from "@/lib/types";

function plantLocationSummary(locations: string[]) {
  if (locations.length === 0) return "—";
  if (locations.length === 1) return locations[0];
  return `${locations.length} locations`;
}

export function CustomersTable() {
  const { customers, deleteCustomer, importCustomers, masterData } =
    useCrmData();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [sheetCustomer, setSheetCustomer] = React.useState<Customer | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [deleteCustomerRecord, setDeleteCustomerRecord] =
    React.useState<Customer | null>(null);
  const [deleteError, setDeleteError] = React.useState("");
  const [importMessage, setImportMessage] = React.useState("");
  const [importError, setImportError] = React.useState("");

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

  const toggleExpanded = (customerId: string) => {
    setExpandedId((current) => (current === customerId ? null : customerId));
  };

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
    if (expandedId === deleteCustomerRecord.id) {
      setExpandedId(null);
    }
    setDeleteCustomerRecord(null);
  };

  const handleImportClick = () => {
    setImportMessage("");
    setImportError("");
    fileInputRef.current?.click();
  };

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["xlsx", "xls", "csv"].includes(extension)) {
      setImportError("Please upload an Excel file (.xlsx, .xls) or .csv.");
      return;
    }

    try {
      const { customers: imported, errors } =
        await parseCustomersExcelFile(file, masterData);

      if (imported.length === 0) {
        setImportError(
          errors[0] ?? "No valid customer rows found in the file."
        );
        return;
      }

      importCustomers(imported);

      const importedCount = imported.length;
      const errorNote =
        errors.length > 0 ? ` ${errors.length} row(s) were skipped.` : "";
      const message = `Imported ${importedCount} customer${importedCount === 1 ? "" : "s"}.${errorNote}`;
      setImportMessage(message);
      notifyInfo("Import complete", message);
      if (errors.length > 0) {
        const errorText = errors.slice(0, 3).join(" ");
        setImportError(errorText);
        notifyError("Some rows were skipped", errorText);
      }
    } catch {
      const message =
        "Could not read the Excel file. Check the format and try again.";
      setImportError(message);
      notifyError("Import failed", message);
    }
  };

  const columnCount = 10;

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
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleImportFile}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleImportClick}
            >
              <Upload className="h-4 w-4" />
              Import Excel
            </Button>
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
        {(importMessage || importError) && (
          <div className="space-y-1 text-sm">
            {importMessage && (
              <p className="text-muted-foreground">{importMessage}</p>
            )}
            {importError && <p className="text-destructive">{importError}</p>}
          </div>
        )}
        <CustomersMobileList
          customers={customers}
          expandedId={expandedId}
          onToggleExpanded={toggleExpanded}
          onEdit={openSheet}
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
                <TableHead className="w-8" />
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
              {customers.map((customer) => {
                const isExpanded = expandedId === customer.id;

                return (
                  <React.Fragment key={customer.id}>
                    <TableRow
                      className={cn(
                        "cursor-pointer",
                        isExpanded && "bg-muted/50"
                      )}
                      onClick={() => toggleExpanded(customer.id)}
                    >
                      <TableCell className="w-8 px-2">
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            isExpanded && "rotate-90"
                          )}
                        />
                      </TableCell>
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
                      <TableCell>
                        <TableActions
                          onEdit={() => openSheet(customer)}
                          onDelete={() => {
                            setDeleteError("");
                            setDeleteCustomerRecord(customer);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableCell
                          colSpan={columnCount}
                          className="whitespace-normal border-t-0 px-6 py-4"
                        >
                          <CustomerExpandedDetails customer={customer} />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
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
