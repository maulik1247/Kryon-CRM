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
import { TablePagination } from "@/components/shared/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import Link from "next/link";
import { useRecordNavigation } from "@/hooks/use-record-navigation";
import { DocumentExchangeMobileList } from "./document-exchange-mobile-list";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { getDocumentExchangeStatusVariant } from "@/lib/document-exchange-constants";
import { filterDocumentExchangesForUser } from "@/lib/user-helpers";
import { sortByCreatedAtDesc } from "@/lib/list-helpers";
import { recordNewRoutes, recordRoutes } from "@/lib/record-routes";
import type { DocumentExchange } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { RecordIdText } from "@/components/shared/record-id";
import { getUserName } from "@/lib/user-helpers";

export function DocumentExchangeTable() {
  const { currentUser, users } = useAuth();
  const { documentExchanges, deals, deleteDocumentExchange, getCustomerById } =
    useCrmData();
  const { goToDocument } = useRecordNavigation();
  const [deleteRecord, setDeleteRecord] =
    React.useState<DocumentExchange | null>(null);

  const records = React.useMemo(
    () =>
      sortByCreatedAtDesc(
        filterDocumentExchangesForUser(
          documentExchanges,
          deals,
          currentUser,
          users
        )
      ),
    [documentExchanges, deals, currentUser, users]
  );

  const {
    paginatedItems,
    page,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    setPage,
  } = usePagination(records);

  const handleDeleteConfirm = () => {
    if (!deleteRecord) return;
    deleteDocumentExchange(deleteRecord.id);

    setDeleteRecord(null);
  };

  return (
    <>
      <React.Suspense fallback={null}>
        <OpenFromUrl
          getHref={recordRoutes.document}
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
          <Button asChild>
            <Link href={recordNewRoutes.document}>
              <Plus className="h-4 w-4" />
              Add Document
            </Link>
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
                <Button asChild>
                  <Link href={recordNewRoutes.document}>
                    <Plus className="h-4 w-4" />
                    Add Document
                  </Link>
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <DocumentExchangeMobileList
              records={paginatedItems}
              users={users}
              onOpen={(record) => goToDocument(record.id)}
              onDelete={setDeleteRecord}
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
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Signed</TableHead>
                  <TableHead>Added on</TableHead>
                  <TableHead>Added by</TableHead>
                  <TableHead className="w-[88px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="p-0">
                      <EmptyState
                        icon={FileText}
                        title="No documents yet"
                        description="Log NDAs, datasheets, and other files exchanged with customers."
                        action={
                          <Button asChild>
                            <Link href={recordNewRoutes.document}>
                              <Plus className="h-4 w-4" />
                              Add Document
                            </Link>
                          </Button>
                        }
                        className="m-4 border-none bg-transparent shadow-none"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((record) => {
                    const customer = getCustomerById(record.customerId);

                    return (
                      <TableRow
                        key={record.id}
                        className="cursor-pointer"
                        onClick={() => goToDocument(record.id)}
                      >
                        <TableCell>
                          <RecordIdText id={record.id} />
                        </TableCell>
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
                        <TableCell className="whitespace-nowrap">
                          {formatDate(record.createdAt)}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate">
                          {getUserName(users, record.createdByUserId)}
                        </TableCell>
                        <TableCell>
                          <TableActions
                            onEdit={() => goToDocument(record.id)}
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
      </div>

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
