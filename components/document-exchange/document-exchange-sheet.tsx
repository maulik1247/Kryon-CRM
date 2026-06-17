"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DeleteRecordButton } from "@/components/shared/delete-record-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FormField } from "@/components/shared/form-field";
import { FormSelect } from "@/components/shared/form-select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CustomerSearchSelect } from "@/components/shared/customer-search-select";
import { DocumentFilesEditor } from "@/components/shared/document-files-editor";
import { DatePicker } from "@/components/ui/date-picker";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
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

interface DocumentExchangeSheetProps {
  record: DocumentExchange | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentExchangeSheet({
  record: recordProp,
  open,
  onOpenChange,
}: DocumentExchangeSheetProps) {
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

  const record = recordProp
    ? getDocumentExchangeById(recordProp.id) ?? recordProp
    : null;
  const isAdd = !recordProp;
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
    if (open) {
      setForm(record ? recordToForm(record) : emptyForm());
    }
  }, [open, record]);

  const update = <K extends keyof DocumentExchangeFormState>(
    field: K,
    value: DocumentExchangeFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (isAdd) {
      addDocumentExchange(
        formToRecord(
          form,
          `docx-${Date.now()}`,
          currentUser.id,
          new Date().toISOString()
        )
      );
    } else if (record) {
      updateDocumentExchange(
        record.id,
        formToRecord(form, record.id, record.createdByUserId, record.createdAt)
      );
    }

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!record) return;
    deleteDocumentExchange(record.id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-4 text-left">
          <SheetTitle className="font-display">
            {isAdd ? "Add Document" : record?.documentType ?? "Document"}
          </SheetTitle>
          <SheetDescription>
            Track NDAs and documents exchanged with customers.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
            <Tabs defaultValue="record" className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-3">
                <TabsTrigger value="record">Record</TabsTrigger>
                <TabsTrigger value="files">
                  Files
                  {form.files.length > 0 ? (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({form.files.length})
                    </span>
                  ) : null}
                </TabsTrigger>
                <TabsTrigger value="signing">Signing</TabsTrigger>
              </TabsList>

              <TabsContent value="record" className="mt-4 space-y-4">
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
              </TabsContent>

              <TabsContent value="files" className="mt-4 space-y-4">
            <DocumentFilesEditor
              value={form.files}
              onChange={(files) => update("files", files)}
              description="PDF, DOC, JPG — multiple files allowed."
              optional
            />
              </TabsContent>

              <TabsContent value="signing" className="mt-4 space-y-4">
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
                E-sign via DocuSign / Zoho Sign, or upload the signed copy in
                the Files tab.
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
              </TabsContent>
            </Tabs>
          </div>

          <SheetFooter className="shrink-0 border-t px-6 py-4 sm:justify-between">
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
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={!form.customerId}>
                {isAdd ? "Save Document" : "Save Changes"}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
