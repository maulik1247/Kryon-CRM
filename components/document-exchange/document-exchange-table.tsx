"use client";

import * as React from "react";
import { FileText, Plus } from "lucide-react";
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
import { DocumentExchangeSheet } from "./document-exchange-sheet";
import { DocumentExchangeMobileList } from "./document-exchange-mobile-list";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { getDocumentExchangeStatusVariant } from "@/lib/document-exchange-constants";
import { filterDocumentExchangesForUser } from "@/lib/user-helpers";
import type { DocumentExchange } from "@/lib/types";

export function DocumentExchangeTable() {
  const { currentUser, users } = useAuth();
  const { documentExchanges, deals, deleteDocumentExchange, getCustomerById } =
    useCrmData();
  const [sheetRecord, setSheetRecord] =
    React.useState<DocumentExchange | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [deleteRecord, setDeleteRecord] =
    React.useState<DocumentExchange | null>(null);

  const records = React.useMemo(
    () =>
      filterDocumentExchangesForUser(
        documentExchanges,
        deals,
        currentUser,
        users
      ),
    [documentExchanges, deals, currentUser, users]
  );

  const openSheet = (record: DocumentExchange | null) => {
    setSheetRecord(record);
    setSheetOpen(true);
  };

  const openSheetById = React.useCallback(
    (id: string) => {
      const record = records.find((entry) => entry.id === id);
      if (record) openSheet(record);
    },
    [records]
  );

  const handleDeleteConfirm = () => {
    if (!deleteRecord) return;
    deleteDocumentExchange(deleteRecord.id);

    if (sheetRecord?.id === deleteRecord.id) {
      setSheetOpen(false);
      setSheetRecord(null);
    }
    setDeleteRecord(null);
  };

  return (
    <>
      <React.Suspense fallback={null}>
        <OpenFromUrl
          onOpen={openSheetById}
          canOpen={(id) => records.some((entry) => entry.id === id)}
        />
      </React.Suspense>

      <PageToolbar
        description="NDAs and documents sent to or received from customers."
        meta={
          <span>
            <span className="font-medium text-foreground">{records.length}</span>{" "}
            {records.length === 1 ? "record" : "records"}
          </span>
        }
        actions={
          <Button onClick={() => openSheet(null)}>
            <Plus className="h-4 w-4" />
            Add Document
          </Button>
        }
      />

      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="md:hidden">
            <EmptyState
              icon={FileText}
              title="No documents yet"
              description="Log NDAs, datasheets, and other files exchanged with customers."
              action={
                <Button onClick={() => openSheet(null)}>
                  <Plus className="h-4 w-4" />
                  Add Document
                </Button>
              }
            />
          </div>
        ) : (
          <DocumentExchangeMobileList
            records={records}
            onOpen={openSheet}
            onDelete={setDeleteRecord}
          />
        )}

        <Card className="hidden shadow-sm md:block">
          <MobileTableScroll>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Signed</TableHead>
                  <TableHead className="w-[88px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0">
                      <EmptyState
                        icon={FileText}
                        title="No documents yet"
                        description="Log NDAs, datasheets, and other files exchanged with customers."
                        action={
                          <Button onClick={() => openSheet(null)}>
                            <Plus className="h-4 w-4" />
                            Add Document
                          </Button>
                        }
                        className="m-4 border-none bg-transparent shadow-none"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => {
                    const customer = getCustomerById(record.customerId);

                    return (
                      <TableRow
                        key={record.id}
                        className="cursor-pointer"
                        onClick={() => openSheet(record)}
                      >
                        <TableCell className="max-w-[180px] truncate font-medium">
                          {record.documentType}
                        </TableCell>
                        <TableCell className="max-w-[160px] truncate">
                          {customer?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {record.direction === "Sent to Customer"
                            ? "Sent"
                            : "Received"}
                        </TableCell>
                        <TableCell>{record.exchangeDate}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getDocumentExchangeStatusVariant(
                              record.status
                            )}
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.files.length}</TableCell>
                        <TableCell>{record.signedCopyUploaded}</TableCell>
                        <TableCell>
                          <TableActions
                            onEdit={() => openSheet(record)}
                            onDelete={() => setDeleteRecord(record)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </MobileTableScroll>
        </Card>
      </div>

      <DocumentExchangeSheet
        record={sheetRecord}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setSheetRecord(null);
        }}
      />

      <DeleteConfirmDialog
        open={!!deleteRecord}
        onOpenChange={(open) => {
          if (!open) setDeleteRecord(null);
        }}
        title="Delete document record?"
        description={`This will permanently remove this ${deleteRecord?.documentType ?? "document"} record.`}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
