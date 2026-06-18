import { DetailGrid } from "@/components/shared/detail-grid";
import { DocumentFileIcon } from "@/components/shared/document-file-icon";
import { useCrmData } from "@/lib/crm-data-provider";
import type { CrmUser, DocumentExchange } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { getUserName } from "@/lib/user-helpers";

export function DocumentExchangeExpandedDetails({
  record,
  users,
}: {
  record: DocumentExchange;
  users: CrmUser[];
}) {
  const { getCustomerById, getDealById } = useCrmData();
  const customer = getCustomerById(record.customerId);
  const deal = record.dealId ? getDealById(record.dealId) : undefined;

  return (
    <div className="space-y-4">
      <DetailGrid
        items={[
          { label: "ID", value: record.id, mono: true },
          { label: "Customer", value: customer?.name },
          { label: "Deal", value: deal?.id },
          { label: "Direction", value: record.direction },
          { label: "Date", value: record.exchangeDate },
          { label: "Added on", value: formatDate(record.createdAt) },
          {
            label: "Added by",
            value: getUserName(users, record.createdByUserId),
          },
          { label: "Status", value: record.status },
          { label: "Signed copy", value: record.signedCopyUploaded },
          { label: "Version", value: record.versionNumber },
          { label: "Expires", value: record.validityExpiryDate },
          {
            label: "Remarks",
            value: record.remarks,
            className: "col-span-2",
          },
        ]}
      />

      {record.files.length > 0 ? (
        <ul className="space-y-2">
          {record.files.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <DocumentFileIcon filename={file.name} className="h-4 w-4" />
              <span className="truncate">{file.name}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
