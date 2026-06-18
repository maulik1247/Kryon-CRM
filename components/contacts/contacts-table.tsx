"use client";

import * as React from "react";
import { Plus, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RoleBadge } from "@/components/shared/role-badge";
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
import { useAuth } from "@/lib/auth-provider";
import { ContactsMobileList } from "./contacts-mobile-list";
import { useCrmData } from "@/lib/crm-data-provider";
import { sortByCreatedAtDesc } from "@/lib/list-helpers";
import { recordNewRoutes, recordRoutes } from "@/lib/record-routes";
import { getUserName } from "@/lib/user-helpers";
import type { Contact } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { RecordIdText } from "@/components/shared/record-id";
import { Star } from "lucide-react";

export function ContactsTable() {
  const { users } = useAuth();
  const { contacts, getCustomerById, deleteContact } = useCrmData();
  const { goToContact } = useRecordNavigation();
  const [deleteContactRecord, setDeleteContactRecord] =
    React.useState<Contact | null>(null);
  const [deleteError, setDeleteError] = React.useState("");

  const sortedContacts = React.useMemo(
    () => sortByCreatedAtDesc(contacts),
    [contacts]
  );

  const {
    paginatedItems,
    page,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    setPage,
  } = usePagination(sortedContacts);

  const handleDeleteConfirm = () => {
    if (!deleteContactRecord) return;

    const removed = deleteContact(deleteContactRecord.id);
    if (!removed) {
      setDeleteError(
        "Cannot delete a contact linked to a deal. Reassign the deal first."
      );
      return;
    }

    setDeleteContactRecord(null);
  };

  return (
    <>
      <React.Suspense fallback={null}>
        <OpenFromUrl
          getHref={recordRoutes.contact}
          canOpen={(id) => contacts.some((entry) => entry.id === id)}
        />
      </React.Suspense>

      <PageToolbar
        description="Multiple contacts per customer — decision makers across R&D, Purchase, VD, Quality, and Management."
        meta={
          <span>
            <span className="font-medium text-foreground">{contacts.length}</span>{" "}
            {contacts.length === 1 ? "contact" : "contacts"}
          </span>
        }
        actions={
          <Button asChild>
            <Link href={recordNewRoutes.contact}>
              <Plus className="h-4 w-4" />
              Add Contact
            </Link>
          </Button>
        }
      />

      <div className="space-y-4">
        {contacts.length === 0 ? (
          <div className="md:hidden">
            <EmptyState
              icon={Users}
              title="No contacts yet"
              description="Add decision makers and champions for your OEM accounts."
              action={
                <Button asChild>
                  <Link href={recordNewRoutes.contact}>
                    <Plus className="h-4 w-4" />
                    Add Contact
                  </Link>
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <ContactsMobileList
              contacts={paginatedItems}
              users={users}
              customerName={(customerId) =>
                getCustomerById(customerId)?.name
              }
              onOpen={(contact) => goToContact(contact.id)}
              onDelete={(contact) => {
                setDeleteError("");
                setDeleteContactRecord(contact);
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
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Buying Role</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead className="w-20 text-center">Primary</TableHead>
                <TableHead>Added on</TableHead>
                <TableHead>Added by</TableHead>
                <TableHead className="w-[88px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="p-0">
                    <EmptyState
                      icon={Users}
                      title="No contacts yet"
                      description="Add decision makers and champions for your OEM accounts."
                      action={
                        <Button asChild>
                          <Link href={recordNewRoutes.contact}>
                            <Plus className="h-4 w-4" />
                            Add Contact
                          </Link>
                        </Button>
                      }
                      className="m-4 border-none bg-transparent shadow-none"
                    />
                  </TableCell>
                </TableRow>
              ) : (
              paginatedItems.map((contact) => {
                const customer = getCustomerById(contact.customerId);
                return (
                  <TableRow
                    key={contact.id}
                    className="cursor-pointer"
                    onClick={() => goToContact(contact.id)}
                  >
                    <TableCell>
                      <RecordIdText id={contact.id} />
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate font-medium">
                      {contact.name}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate">
                      {contact.designation}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate">
                      {contact.department}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate">
                      {customer?.name}
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={contact.buyingRole} />
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-muted-foreground">
                      {contact.phone}
                    </TableCell>
                    <TableCell className="text-center">
                      {contact.isPrimary ? (
                        <Star className="mx-auto inline h-4 w-4 fill-primary text-primary" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(contact.createdAt)}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate">
                      {getUserName(users, contact.createdByUserId)}
                    </TableCell>
                    <TableCell>
                      <TableActions
                        onEdit={() => goToContact(contact.id)}
                        onDelete={() => {
                          setDeleteError("");
                          setDeleteContactRecord(contact);
                        }}
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
        {deleteError && (
          <p className="text-sm text-destructive">{deleteError}</p>
        )}
      </div>

      <DeleteConfirmDialog
        open={!!deleteContactRecord}
        onOpenChange={(open) => {
          if (!open) setDeleteContactRecord(null);
        }}
        title="Delete contact?"
        description={`This will permanently remove ${deleteContactRecord?.name ?? "this contact"}.`}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
