"use client";

import * as React from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/shared/form-field";
import { InfoTip } from "@/components/shared/info-tip";
import { FormSelect } from "@/components/shared/form-select";
import { HELP } from "@/lib/help-content";
import { useCrmData } from "@/lib/crm-data-provider";
import { useAuth } from "@/lib/auth-provider";
import type { ConfidenceLevel, Deal, PipelineStage } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

function createDefaultForm(
  defaultStageId: PipelineStage,
  defaultOwner: string
) {
  return {
    customerId: "",
    contactId: "",
    productId: "",
    quantity: "",
    currentSupplierPrice: "",
    quotedPrice: "",
    confidence: "25" as `${ConfidenceLevel}`,
    stage: defaultStageId,
    owner: defaultOwner,
    taskTitle: "",
    taskDueDate: "",
  };
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function createDealId(existingDeals: Deal[]): string {
  const year = new Date().getFullYear();
  const maxNum = existingDeals.reduce((max, deal) => {
    const match = deal.id.match(/DEAL-\d+-(\d+)/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `DEAL-${year}-${String(maxNum + 1).padStart(3, "0")}`;
}

export function AddLeadDialog() {
  const { currentUser } = useAuth();
  const {
    customers,
    contacts,
    products,
    deals,
    addDeal,
    addDealTask,
    pipelineStages,
    masterData,
    getContactsByCustomerId,
    getProductById,
  } = useCrmData();

  const openStages = pipelineStages.filter((stage) => stage.kind === "open");
  const defaultStageId = openStages[0]?.id ?? pipelineStages[0]?.id ?? "";

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(() => {
    const firstProduct = products[0];
    return {
      ...createDefaultForm(
        defaultStageId,
        masterData.accountOwners[0] ?? ""
      ),
      customerId: customers[0]?.id ?? "",
      productId: firstProduct?.id ?? "",
      quotedPrice: firstProduct ? String(firstProduct.sellingPrice) : "",
      currentSupplierPrice: firstProduct
        ? String(Math.round(firstProduct.sellingPrice * 1.12))
        : "",
      taskDueDate: new Date().toISOString().split("T")[0],
    };
  });

  const customerContacts = React.useMemo(
    () =>
      form.customerId ? getContactsByCustomerId(form.customerId) : [],
    [form.customerId, getContactsByCustomerId]
  );

  const selectedProduct = getProductById(form.productId);
  const quantity = Number(form.quantity) || 0;
  const quotedPrice = Number(form.quotedPrice) || 0;
  const estimatedValue = quantity * quotedPrice;

  React.useEffect(() => {
    if (!form.customerId && customers[0]) {
      setForm((prev) => ({ ...prev, customerId: customers[0].id }));
    }
  }, [customers, form.customerId]);

  React.useEffect(() => {
    if (!form.productId && products[0]) {
      setForm((prev) => ({
        ...prev,
        productId: products[0].id,
        quotedPrice: String(products[0].sellingPrice),
        currentSupplierPrice: String(Math.round(products[0].sellingPrice * 1.12)),
      }));
    }
  }, [products, form.productId]);

  React.useEffect(() => {
    const validContact = customerContacts.some((c) => c.id === form.contactId);
    if (!validContact) {
      const primary =
        customerContacts.find((c) => c.isPrimary) ?? customerContacts[0];
      setForm((prev) => ({ ...prev, contactId: primary?.id ?? "" }));
    }
  }, [customerContacts, form.contactId]);

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    const firstProduct = products[0];
    setForm({
      ...createDefaultForm(
        defaultStageId,
        masterData.accountOwners[0] ?? ""
      ),
      customerId: customers[0]?.id ?? "",
      productId: firstProduct?.id ?? "",
      quotedPrice: firstProduct ? String(firstProduct.sellingPrice) : "",
      currentSupplierPrice: firstProduct
        ? String(Math.round(firstProduct.sellingPrice * 1.12))
        : "",
      taskDueDate: new Date().toISOString().split("T")[0],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const today = new Date().toISOString().split("T")[0];
    const deal: Deal = {
      id: createDealId(deals),
      customerId: form.customerId,
      contactId: form.contactId,
      productId: form.productId,
      quantity,
      estimatedAnnualValue: estimatedValue,
      currentSupplierPrice: Number(form.currentSupplierPrice) || 0,
      quotedPrice,
      confidence: Number(form.confidence) as ConfidenceLevel,
      stage: form.stage,
      stageEnteredAt: today,
      lastActivityAt: today,
      owner: form.owner,
    };

    addDeal(deal);

    if (form.taskTitle.trim()) {
      addDealTask({
        dealId: deal.id,
        title: form.taskTitle.trim(),
        dueDate: form.taskDueDate || today,
        createdByUserId: currentUser.id,
        assignedToUserId: currentUser.id,
        assignerName: currentUser.name,
      });
    }

    resetForm();
    setOpen(false);
  };

  const canSubmit =
    form.customerId &&
    form.contactId &&
    form.productId &&
    quantity > 0 &&
    quotedPrice > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl gap-0 p-0 sm:max-h-[90vh]">
        <div className="border-b bg-muted/30 px-6 py-5">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <DialogTitle>Add New Lead</DialogTitle>
                <DialogDescription className="mt-1">
                  Create a new deal and choose its starting stage.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto px-6 py-5">
          <FormSection
            title="Opportunity"
            description="Link the lead to a customer, contact, and product."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Customer" htmlFor="lead-customer">
                <FormSelect
                  id="lead-customer"
                  value={form.customerId}
                  onValueChange={(v) => update("customerId", v)}
                  disabled={customers.length === 0}
                  placeholder="Select customer"
                  options={customers.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                />
              </FormField>
              <FormField label="Contact" htmlFor="lead-contact">
                <FormSelect
                  id="lead-contact"
                  value={form.contactId}
                  onValueChange={(v) => update("contactId", v)}
                  disabled={customerContacts.length === 0}
                  placeholder="Select contact"
                  options={customerContacts.map((c) => ({
                    value: c.id,
                    label: `${c.name}${c.isPrimary ? " (Primary)" : ""}`,
                  }))}
                />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Product" htmlFor="lead-product">
                <FormSelect
                  id="lead-product"
                  value={form.productId}
                  onValueChange={(v) => {
                    const product = products.find((p) => p.id === v);
                    setForm((prev) => ({
                      ...prev,
                      productId: v,
                      quotedPrice: product
                        ? String(product.sellingPrice)
                        : prev.quotedPrice,
                      currentSupplierPrice: product
                        ? String(Math.round(product.sellingPrice * 1.12))
                        : prev.currentSupplierPrice,
                    }));
                  }}
                  disabled={products.length === 0}
                  placeholder="Select product"
                  options={products.map((p) => ({
                    value: p.id,
                    label: `${p.sku} — ${p.model}`,
                  }))}
                />
              </FormField>
              <FormField label="Annual Quantity" htmlFor="lead-quantity">
                <Input
                  id="lead-quantity"
                  type="number"
                  min={1}
                  required
                  placeholder="e.g. 50000"
                  value={form.quantity}
                  onChange={(e) => update("quantity", e.target.value)}
                />
              </FormField>
            </div>
          </FormSection>

          <Separator />

          <FormSection
            title="Pricing & Confidence"
            description="Set pricing assumptions and initial win probability."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                label="Supplier Price (₹)"
                htmlFor="supplier-price"
                info={HELP.supplierPrice}
              >
                <Input
                  id="supplier-price"
                  type="number"
                  min={0}
                  required
                  value={form.currentSupplierPrice}
                  onChange={(e) =>
                    update("currentSupplierPrice", e.target.value)
                  }
                />
              </FormField>
              <FormField label="Our Quote (₹)" htmlFor="quoted-price">
                <Input
                  id="quoted-price"
                  type="number"
                  min={0}
                  required
                  value={form.quotedPrice}
                  onChange={(e) => update("quotedPrice", e.target.value)}
                />
              </FormField>
              <FormField
                label="Confidence"
                htmlFor="confidence"
                info={HELP.confidence}
              >
                <FormSelect
                  id="confidence"
                  value={form.confidence}
                  onValueChange={(v) => update("confidence", v)}
                  options={[
                    { value: "100", label: "100% — Certain" },
                    { value: "75", label: "75% — Likely" },
                    { value: "50", label: "50% — Possible" },
                    { value: "25", label: "25% — Early" },
                    { value: "0", label: "0% — Unlikely" },
                  ]}
                />
              </FormField>
            </div>

            {estimatedValue > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  Estimated annual value
                  <InfoTip content={HELP.estimatedValue} />
                </span>
                <span className="font-display text-lg font-semibold text-primary">
                  {formatCurrency(estimatedValue)}
                </span>
              </div>
            )}
          </FormSection>

          <Separator />

          <FormSection
            title="Assignment"
            description="Who owns this deal and where it starts."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Deal Owner"
                htmlFor="lead-owner"
                info={HELP.dealOwner}
              >
                <FormSelect
                  id="lead-owner"
                  value={form.owner}
                  onValueChange={(v) => update("owner", v)}
                  options={masterData.accountOwners.map((owner) => ({
                    value: owner,
                    label: owner,
                  }))}
                />
              </FormField>
              <FormField
                label="Starting Stage"
                htmlFor="lead-stage"
                info={HELP.startingStage}
              >
                <FormSelect
                  id="lead-stage"
                  value={form.stage}
                  onValueChange={(v) => update("stage", v)}
                  options={openStages.map((stage) => ({
                    value: stage.id,
                    label: stage.name,
                  }))}
                />
              </FormField>
            </div>
          </FormSection>

          <Separator />

          <FormSection
            title="First task"
            description="Optional — add a follow-up task for this deal."
          >
            <FormField label="What to do" htmlFor="lead-task-title">
              <Textarea
                id="lead-task-title"
                rows={2}
                placeholder="e.g. Schedule intro call with procurement team"
                value={form.taskTitle}
                onChange={(e) => update("taskTitle", e.target.value)}
              />
            </FormField>
            <FormField label="Do by" htmlFor="lead-task-due" info={HELP.doBy}>
              <Input
                id="lead-task-due"
                type="date"
                value={form.taskDueDate}
                onChange={(e) => update("taskDueDate", e.target.value)}
              />
            </FormField>
          </FormSection>

          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/20 px-4 py-3">
            <span className="text-xs text-muted-foreground">Deal entry</span>
            <Badge variant="default">
              {pipelineStages.find((s) => s.id === form.stage)?.name ??
                form.stage}
            </Badge>
            {selectedProduct && (
              <Badge variant="outline">{selectedProduct.sku}</Badge>
            )}
          </div>

          <DialogFooter className="border-t pt-4 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Create Lead
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
