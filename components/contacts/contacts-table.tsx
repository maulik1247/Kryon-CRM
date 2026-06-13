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
import { ContactSheet } from "./contact-sheet";
import { ContactsMobileList } from "./contacts-mobile-list";
import { useCrmData } from "@/lib/crm-data-provider";
import type { Contact } from "@/lib/types";
import { Star } from "lucide-react";

export function ContactsTable() {
  const { contacts, getCustomerById, deleteContact } = useCrmData();
  const [sheetContact, setSheetContact] = React.useState<Contact | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [deleteContactRecord, setDeleteContactRecord] =
    React.useState<Contact | null>(null);
  const [deleteError, setDeleteError] = React.useState("");

  const openSheet = (contact: Contact | null) => {
    setSheetContact(contact);
    setSheetOpen(true);
  };

  const openSheetById = React.useCallback(
    (id: string) => {
      const contact = contacts.find((entry) => entry.id === id);
      if (contact) openSheet(contact);
    },
    [contacts]
  );

  const handleDeleteConfirm = () => {
    if (!deleteContactRecord) return;

    const removed = deleteContact(deleteContactRecord.id);
    if (!removed) {
      setDeleteError(
        "Cannot delete a contact linked to a deal. Reassign the deal first."
      );
      return;
    }

    if (sheetContact?.id === deleteContactRecord.id) {
      setSheetOpen(false);
      setSheetContact(null);
    }
    setDeleteContactRecord(null);
  };

  return (
    <>
      <React.Suspense fallback={null}>
        <OpenFromUrl
          onOpen={openSheetById}
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
          <Button onClick={() => openSheet(null)}>
            <Plus className="h-4 w-4" />
            Add Contact
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
                <Button onClick={() => openSheet(null)}>
                  <Plus className="h-4 w-4" />
                  Add Contact
                </Button>
              }
            />
          </div>
        ) : (
          <ContactsMobileList
            contacts={contacts}
            customerName={(customerId) =>
              getCustomerById(customerId)?.name
            }
            onOpen={openSheet}
            onDelete={(contact) => {
              setDeleteError("");
              setDeleteContactRecord(contact);
            }}
          />
        )}

        <Card className="hidden shadow-sm md:block">
          <MobileTableScroll>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Buying Role</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead className="w-20 text-center">Primary</TableHead>
                <TableHead className="w-[88px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-0">
                    <EmptyState
                      icon={Users}
                      title="No contacts yet"
                      description="Add decision makers and champions for your OEM accounts."
                      action={
                        <Button onClick={() => openSheet(null)}>
                          <Plus className="h-4 w-4" />
                          Add Contact
                        </Button>
                      }
                      className="m-4 border-none bg-transparent shadow-none"
                    />
                  </TableCell>
                </TableRow>
              ) : (
              contacts.map((contact) => {
                const customer = getCustomerById(contact.customerId);
                return (
                  <TableRow
                    key={contact.id}
                    className="cursor-pointer"
                    onClick={() => openSheet(contact)}
                  >
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
                    <TableCell>
                      <TableActions
                        onEdit={() => openSheet(contact)}
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
        </Card>
        {deleteError && (
          <p className="text-sm text-destructive">{deleteError}</p>
        )}
      </div>

      <ContactSheet
        contact={sheetContact}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setSheetContact(null);
        }}
      />

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
