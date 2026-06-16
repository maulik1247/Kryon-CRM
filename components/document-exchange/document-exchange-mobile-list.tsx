"use client";

import { Badge } from "@/components/ui/badge";
import { TableActions } from "@/components/shared/table-actions";
import {
  ExpandableMobileCard,
  useExpandableCards,
} from "@/components/shared/expandable-mobile-card";
import { DocumentExchangeExpandedDetails } from "./document-exchange-expanded-details";
import { getDocumentExchangeStatusVariant } from "@/lib/document-exchange-constants";
import { useCrmData } from "@/lib/crm-data-provider";
import type { CrmUser, DocumentExchange } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { getUserName } from "@/lib/user-helpers";

interface DocumentExchangeMobileListProps {
  records: DocumentExchange[];
  users: CrmUser[];
  onOpen: (record: DocumentExchange) => void;
  onDelete: (record: DocumentExchange) => void;
}

export function DocumentExchangeMobileList({
  records,
  users,
  onOpen,
  onDelete,
}: DocumentExchangeMobileListProps) {
  const { getCustomerById } = useCrmData();
  const { expandedId, toggleExpanded } = useExpandableCards();

  return (
    <div className="space-y-3 md:hidden">
      {records.map((record) => {
        const customer = getCustomerById(record.customerId);

        return (
          <ExpandableMobileCard
            key={record.id}
            id={record.id}
            expandedId={expandedId}
            onToggle={toggleExpanded}
            summary={
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Badge
                      variant={getDocumentExchangeStatusVariant(record.status)}
                      className="mb-2"
                    >
                      {record.status}
                    </Badge>
                    <p className="font-display font-semibold leading-snug">
                      {record.documentType}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {customer?.name ?? "Unknown customer"} · {record.exchangeDate}{" "}
                  · Added on {formatDate(record.createdAt)} · Added by{" "}
                  {getUserName(users, record.createdByUserId)}
                </p>
              </div>
            }
            details={
              <DocumentExchangeExpandedDetails record={record} users={users} />
            }
            actions={
              <TableActions
                onEdit={() => onOpen(record)}
                onDelete={() => onDelete(record)}
              />
            }
          />
        );
      })}
    </div>
  );
}
