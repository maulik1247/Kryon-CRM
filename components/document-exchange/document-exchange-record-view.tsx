"use client";

import { DocumentExchangeForm } from "@/components/document-exchange/document-exchange-form";
import { RecordNotFound } from "@/components/records/record-not-found";
import { useCrmData } from "@/lib/crm-data-provider";
import { recordListRoutes } from "@/lib/record-routes";

export function DocumentExchangeRecordView({ recordId }: { recordId: string }) {
  const { getDocumentExchangeById } = useCrmData();
  const record = getDocumentExchangeById(recordId);

  if (!record) {
    return (
      <RecordNotFound
        backHref={recordListRoutes.document}
        backLabel="documents"
      />
    );
  }

  return <DocumentExchangeForm recordId={recordId} />;
}
