"use client";

import { Star } from "lucide-react";
import { RoleBadge } from "@/components/shared/role-badge";
import { TableActions } from "@/components/shared/table-actions";
import {
  ExpandableMobileCard,
  useExpandableCards,
} from "@/components/shared/expandable-mobile-card";
import { ContactExpandedDetails } from "./contact-expanded-details";
import type { Contact, CrmUser } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { RecordIdText } from "@/components/shared/record-id";
import { getUserName } from "@/lib/user-helpers";

interface ContactsMobileListProps {
  contacts: Contact[];
  users: CrmUser[];
  customerName: (customerId: string) => string | undefined;
  onOpen: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export function ContactsMobileList({
  contacts,
  users,
  customerName,
  onOpen,
  onDelete,
}: ContactsMobileListProps) {
  const { expandedId, toggleExpanded } = useExpandableCards();

  return (
    <div className="space-y-3 md:hidden">
      {contacts.map((contact) => (
        <ExpandableMobileCard
          key={contact.id}
          id={contact.id}
          expandedId={expandedId}
          onToggle={toggleExpanded}
          summary={
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <RecordIdText id={contact.id} className="mb-1 block" />
                  <p className="font-medium leading-snug">{contact.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {contact.designation}
                  </p>
                </div>
                {contact.isPrimary ? (
                  <Star className="h-4 w-4 shrink-0 fill-primary text-primary" />
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{contact.department}</span>
                <span>·</span>
                <span className="truncate">
                  {customerName(contact.customerId) ?? "—"}
                </span>
                <span>·</span>
                <span>Added on {formatDate(contact.createdAt)}</span>
                <span>·</span>
                <span>
                  Added by {getUserName(users, contact.createdByUserId)}
                </span>
              </div>
              <RoleBadge role={contact.buyingRole} />
            </div>
          }
          details={
            <ContactExpandedDetails
              contact={contact}
              customerName={customerName(contact.customerId)}
            />
          }
          actions={
            <TableActions
              onEdit={() => onOpen(contact)}
              onDelete={() => onDelete(contact)}
            />
          }
        />
      ))}
    </div>
  );
}
