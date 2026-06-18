"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DeleteRecordButton } from "@/components/shared/delete-record-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { FormSelect } from "@/components/shared/form-select";
import { FormSection, FormSections } from "@/components/shared/form-section";
import { ReadOnlyIdField } from "@/components/shared/record-id";
import { CustomerSearchSelect } from "@/components/shared/customer-search-select";
import { DocumentFilesEditor } from "@/components/shared/document-files-editor";
import { DatePicker } from "@/components/ui/date-picker";
import { RecordFormPage } from "@/components/records/record-form-page";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { recordListRoutes, recordRoutes } from "@/lib/record-routes";
import { navigateAfterSave } from "@/lib/navigate-after-save";
import {
  DOCUMENT_DIRECTIONS,
  DOCUMENT_EXCHANGE_STATUSES,
  DOCUMENT_EXCHANGE_TYPES,
  SIGNED_COPY_STATUSES,
} from "@/lib/document-exchange-constants";
import {
  filterCustomersForUser,
  filterDealsForUser,
} from "@/lib/user-helpers";
import type {
  DocumentDirection,
  DocumentExchange,
  DocumentExchangeStatus,
  DocumentExchangeType,
  RegistrationDocument,
  SignedCopyStatus,
} from "@/lib/types";

interface DocumentExchangeFormState {
  customerId: string;
  dealId: string;
  documentType: DocumentExchangeType;
  direction: DocumentDirection;
  exchangeDate: string;
  status: DocumentExchangeStatus;
  files: RegistrationDocument[];
  validityExpiryDate: string;
  versionNumber: string;
  signedCopyUploaded: SignedCopyStatus;
  remarks: string;
}

const emptyForm = (): DocumentExchangeFormState => ({
  customerId: "",
  dealId: "",
  documentType: "NDA (Mutual)",
  direction: "Sent to Customer",
  exchangeDate: new Date().toISOString().split("T")[0],
  status: "Draft",
  files: [],
  validityExpiryDate: "",
  versionNumber: "",
  signedCopyUploaded: "No",
  remarks: "",
});

function recordToForm(record: DocumentExchange): DocumentExchangeFormState {
  return {
    customerId: record.customerId,
    dealId: record.dealId ?? "",
    documentType: record.documentType,
    direction: record.direction,
    exchangeDate: record.exchangeDate,
    status: record.status,
    files: record.files,
    validityExpiryDate: record.validityExpiryDate ?? "",
    versionNumber: record.versionNumber ?? "",
    signedCopyUploaded: record.signedCopyUploaded,
    remarks: record.remarks ?? "",
  };
}

function formToRecord(
  form: DocumentExchangeFormState,
  id: string,
  createdByUserId: string,
  createdAt: string
): DocumentExchange {
  return {
    id,
    customerId: form.customerId,
    dealId: form.dealId || undefined,
    documentType: form.documentType,
    direction: form.direction,
    exchangeDate: form.exchangeDate,
    status: form.status,
    files: form.files,
    validityExpiryDate: form.validityExpiryDate || undefined,
    versionNumber: form.versionNumber.trim() || undefined,
    signedCopyUploaded: form.signedCopyUploaded,
    remarks: form.remarks.trim() || undefined,
    createdByUserId,
    createdAt,
  };
}

interface DocumentExchangeFormProps {
  recordId?: string;
}

export function DocumentExchangeForm({ recordId }: DocumentExchangeFormProps) {
  const router = useRouter();
  const { currentUser, users } = useAuth();
  const {
    customers,
    contacts,
    deals,
    addDocumentExchange,
    updateDocumentExchange,
    deleteDocumentExchange,
    getDocumentExchangeById,
    getDealsByCustomerId,
  } = useCrmData();

  const record = recordId ? getDocumentExchangeById(recordId) : null;
  const isAdd = !recordId;

  const [form, setForm] = React.useState<DocumentExchangeFormState>(emptyForm);

  const visibleCustomers = React.useMemo(
    () => filterCustomersForUser(customers, currentUser, users),
    [customers, currentUser, users]
  );
  const visibleDeals = React.useMemo(
    () => filterDealsForUser(deals, currentUser, users),
    [deals, currentUser, users]
  );
  const customerDeals = React.useMemo(() => {
    if (!form.customerId) return [];
    return getDealsByCustomerId(form.customerId).filter((deal) =>
      visibleDeals.some((entry) => entry.id === deal.id)
    );
  }, [form.customerId, getDealsByCustomerId, visibleDeals]);

  React.useEffect(() => {
    if (record) {
      setForm(recordToForm(record));
    }
  }, [record]);

  const update = <K extends keyof DocumentExchangeFormState>(
    field: K,
    value: DocumentExchangeFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) return;

    if (isAdd) {
      const id = `docx-${Date.now()}`;
      addDocumentExchange(
        formToRecord(
          form,
          id,
          currentUser.id,
          new Date().toISOString()
        )
      );
      navigateAfterSave(router, recordRoutes.document(id));
      return;
    }

    if (!record) return;
    updateDocumentExchange(
      record.id,
      formToRecord(form, record.id, record.createdByUserId, record.createdAt)
    );
    navigateAfterSave(router, recordListRoutes.document);
  };

  const handleDelete = () => {
    if (!record) return;
    deleteDocumentExchange(record.id);
    navigateAfterSave(router, recordListRoutes.document);
  };

  if (!isAdd && !record) {
    return null;
  }

  return (
    <RecordFormPage
      backHref={recordListRoutes.document}
      backLabel="Documents"
      title={isAdd ? "Add Document" : "Edit Document"}
      description={
        isAdd
          ? "Track NDAs and documents exchanged with customers."
          : "Update document exchange details and files."
      }
      onSubmit={handleSubmit}
      footer={
        <>
          {!isAdd ? (
            <DeleteRecordButton
              title="Delete document?"
              description={`This will permanently remove this ${record?.documentType ?? "document"} record.`}
              onConfirm={handleDelete}
            />
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href={recordListRoutes.document}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={!form.customerId}>
              {isAdd ? "Save Document" : "Save Changes"}
            </Button>
          </div>
        </>
      }
    >
      <FormSections>
        <FormSection title="Record">
          {!isAdd && record ? (
            <ReadOnlyIdField
              label="Document ID"
              htmlFor="docx-id"
              id={record.id}
            />
          ) : null}
          <FormField label="Customer" htmlFor="docx-customer">
            <CustomerSearchSelect
              id="docx-customer"
              customers={visibleCustomers}
              contacts={contacts}
              value={form.customerId}
              onValueChange={(customerId) => {
                update("customerId", customerId);
                update("dealId", "");
              }}
            />
          </FormField>

          <FormField label="Deal" htmlFor="docx-deal" optional>
            <FormSelect
              id="docx-deal"
              value={form.dealId || "__none__"}
              onValueChange={(value) =>
                update("dealId", value === "__none__" ? "" : value)
              }
              disabled={!form.customerId}
              placeholder="Optional"
              options={[
                { value: "__none__", label: "No linked deal" },
                ...customerDeals.map((deal) => ({
                  value: deal.id,
                  label: deal.id,
                })),
              ]}
            />
          </FormField>

          <FormField label="Document type" htmlFor="docx-type">
            <FormSelect
              id="docx-type"
              value={form.documentType}
              onValueChange={(value) =>
                update("documentType", value as DocumentExchangeType)
              }
              options={DOCUMENT_EXCHANGE_TYPES.map((type) => ({
                value: type,
                label: type,
              }))}
            />
          </FormField>

          <FormField label="Direction" htmlFor="docx-direction">
            <FormSelect
              id="docx-direction"
              value={form.direction}
              onValueChange={(value) =>
                update("direction", value as DocumentDirection)
              }
              options={DOCUMENT_DIRECTIONS.map((direction) => ({
                value: direction,
                label: direction,
              }))}
            />
          </FormField>

          <FormField label="Date sent or received" htmlFor="docx-date">
            <DatePicker
              value={form.exchangeDate}
              onChange={(value) => update("exchangeDate", value)}
            />
          </FormField>

          <FormField label="Status" htmlFor="docx-status">
            <FormSelect
              id="docx-status"
              value={form.status}
              onValueChange={(value) =>
                update("status", value as DocumentExchangeStatus)
              }
              options={DOCUMENT_EXCHANGE_STATUSES.map((status) => ({
                value: status,
                label: status,
              }))}
            />
          </FormField>
        </FormSection>

        <FormSection title="Files">
          <DocumentFilesEditor
            value={form.files}
            onChange={(files) => update("files", files)}
            description="PDF, DOC, JPG — multiple files allowed."
            optional
          />
        </FormSection>

        <FormSection title="Signing">
          <FormField label="Signed copy uploaded" htmlFor="docx-signed">
            <FormSelect
              id="docx-signed"
              value={form.signedCopyUploaded}
              onValueChange={(value) =>
                update("signedCopyUploaded", value as SignedCopyStatus)
              }
              options={SIGNED_COPY_STATUSES.map((status) => ({
                value: status,
                label: status,
              }))}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              E-sign via DocuSign / Zoho Sign, or upload the signed copy above.
            </p>
          </FormField>

          <FormField label="Validity / expiry date" htmlFor="docx-expiry" optional>
            <DatePicker
              value={form.validityExpiryDate}
              onChange={(value) => update("validityExpiryDate", value)}
              placeholder="Optional"
            />
          </FormField>

          <FormField label="Version number" htmlFor="docx-version" optional>
            <Input
              id="docx-version"
              value={form.versionNumber}
              onChange={(e) => update("versionNumber", e.target.value)}
              placeholder="e.g. 1.0"
            />
          </FormField>

          <FormField label="Remarks" htmlFor="docx-remarks" optional>
            <Textarea
              id="docx-remarks"
              rows={3}
              value={form.remarks}
              onChange={(e) => update("remarks", e.target.value)}
              placeholder="Notes on signing, legal review, etc."
            />
          </FormField>
        </FormSection>
      </FormSections>
    </RecordFormPage>
  );
}
