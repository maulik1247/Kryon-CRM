"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { FormSection } from "@/components/shared/form-section";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { InfoTip } from "@/components/shared/info-tip";
import { FormSelect } from "@/components/shared/form-select";
import { CustomerSearchSelect } from "@/components/shared/customer-search-select";
import { DatePicker } from "@/components/ui/date-picker";
import { HELP } from "@/lib/help-content";
import { useCrmData } from "@/lib/crm-data-provider";
import { useAuth } from "@/lib/auth-provider";
import { canAssignDeals } from "@/lib/role-permissions";
import { filterCustomersForUser } from "@/lib/user-helpers";
import { CONFIDENCE_FORM_OPTIONS } from "@/lib/confidence-constants";
import {
  calculatePriceAdvantage,
  getProductsForCategory,
  suggestSupplierFromCustomerProduct,
} from "@/lib/deal-form-helpers";
import type { ConfidenceLevel, Deal, PipelineStage } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

function createDefaultForm(
  defaultStageId: PipelineStage,
  defaultOwner: string,
  defaultProductCategory: string
) {
  return {
    customerId: "",
    contactId: "",
    productCategory: defaultProductCategory,
    productId: "",
    quantity: "",
    currentSupplierName: "",
    currentSupplierPrice: "",
    quotedPrice: "",
    confidence: "25" as `${ConfidenceLevel}`,
    stage: defaultStageId,
    owner: defaultOwner,
    nextAction: "",
    nextActionDate: "",
  };
}

function createDealId(existingDeals: Deal[]): string {
  const year = new Date().getFullYear();
  const maxNum = existingDeals.reduce((max, deal) => {
    const match = deal.id.match(/DEAL-\d+-(\d+)/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `DEAL-${year}-${String(maxNum + 1).padStart(3, "0")}`;
}

export function AddLeadSheet() {
  const { currentUser, users } = useAuth();
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
    getCustomerById,
    getSupplierById,
  } = useCrmData();

  const defaultStageId =
    pipelineStages.find((stage) => stage.id === "lead-hot")?.id ??
    pipelineStages.find((stage) => stage.kind === "open")?.id ??
    pipelineStages[0]?.id ??
    "";

  const canAssign = canAssignDeals(currentUser.role);

  const visibleCustomers = React.useMemo(
    () => filterCustomersForUser(customers, currentUser, users),
    [customers, currentUser, users]
  );

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(() => {
    const firstProduct = products[0];
    return {
      ...createDefaultForm(
        defaultStageId,
        currentUser.name,
        firstProduct?.motorControllerType ?? ""
      ),
      customerId: visibleCustomers[0]?.id ?? "",
      productId: firstProduct?.id ?? "",
      quotedPrice: firstProduct ? String(firstProduct.sellingPrice) : "",
      currentSupplierPrice: firstProduct
        ? String(Math.round(firstProduct.sellingPrice * 1.12))
        : "",
      nextActionDate: new Date().toISOString().split("T")[0],
    };
  });

  const selectedCustomer = getCustomerById(form.customerId);
  const customerContacts = React.useMemo(
    () =>
      form.customerId ? getContactsByCustomerId(form.customerId) : [],
    [form.customerId, getContactsByCustomerId]
  );
  const categoryProducts = React.useMemo(
    () => getProductsForCategory(products, form.productCategory),
    [products, form.productCategory]
  );
  const selectedProduct = getProductById(form.productId);
  const quantity = Number(form.quantity) || 0;
  const quotedPrice = Number(form.quotedPrice) || 0;
  const supplierPrice = Number(form.currentSupplierPrice) || 0;
  const estimatedValue = quantity * quotedPrice;
  const priceAdvantage = calculatePriceAdvantage(supplierPrice, quotedPrice);

  React.useEffect(() => {
    if (!form.customerId && visibleCustomers[0]) {
      setForm((prev) => ({ ...prev, customerId: visibleCustomers[0].id }));
    }
  }, [visibleCustomers, form.customerId]);

  React.useEffect(() => {
    const validContact = customerContacts.some(
      (contact) => contact.id === form.contactId
    );
    if (!validContact) {
      const primary =
        customerContacts.find((contact) => contact.isPrimary) ??
        customerContacts[0];
      setForm((prev) => ({ ...prev, contactId: primary?.id ?? "" }));
    }
  }, [customerContacts, form.contactId]);

  React.useEffect(() => {
    const validProduct = categoryProducts.some(
      (product) => product.id === form.productId
    );
    if (!validProduct) {
      const nextProduct = categoryProducts[0];
      setForm((prev) => ({
        ...prev,
        productId: nextProduct?.id ?? "",
        quotedPrice: nextProduct
          ? String(nextProduct.sellingPrice)
          : prev.quotedPrice,
        currentSupplierPrice: nextProduct
          ? String(Math.round(nextProduct.sellingPrice * 1.12))
          : prev.currentSupplierPrice,
      }));
    }
  }, [categoryProducts, form.productId]);

  React.useEffect(() => {
    if (!form.productId || !selectedCustomer) return;

    const suggestion = suggestSupplierFromCustomerProduct(
      selectedCustomer,
      form.productId,
      (supplierId) => getSupplierById(supplierId)?.name
    );
    if (!suggestion) return;

    setForm((prev) => ({
      ...prev,
      currentSupplierName: prev.currentSupplierName || suggestion.name,
      currentSupplierPrice:
        prev.currentSupplierPrice || String(suggestion.price || ""),
    }));
  }, [form.productId, selectedCustomer, getSupplierById]);

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    const firstProduct = products[0];
    setForm({
      ...createDefaultForm(
        defaultStageId,
        currentUser.name,
        firstProduct?.motorControllerType ?? ""
      ),
      customerId: visibleCustomers[0]?.id ?? "",
      productId: firstProduct?.id ?? "",
      quotedPrice: firstProduct ? String(firstProduct.sellingPrice) : "",
      currentSupplierPrice: firstProduct
        ? String(Math.round(firstProduct.sellingPrice * 1.12))
        : "",
      nextActionDate: new Date().toISOString().split("T")[0],
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
      currentSupplierName: form.currentSupplierName.trim(),
      currentSupplierPrice: supplierPrice,
      quotedPrice,
      confidence: Number(form.confidence) as ConfidenceLevel,
      stage: form.stage,
      stageEnteredAt: today,
      lastActivityAt: today,
      owner: canAssign ? form.owner : currentUser.name,
    };

    addDeal(deal);

    if (form.nextAction.trim()) {
      addDealTask({
        dealId: deal.id,
        title: form.nextAction.trim(),
        dueDate: form.nextActionDate || today,
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Create Deal
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-4 text-left">
          <SheetTitle className="font-display">Create a Deal</SheetTitle>
          <SheetDescription>
            New opportunity linked to customer, product, and pipeline stage.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="commercial">Commercial</TabsTrigger>
                <TabsTrigger value="followup">Follow-up</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-4">
          <FormSection>
            <div className="space-y-4">
              <FormField label="Customer name" htmlFor="deal-customer">
                <CustomerSearchSelect
                  id="deal-customer"
                  customers={visibleCustomers}
                  contacts={contacts}
                  value={form.customerId}
                  onValueChange={(customerId) => update("customerId", customerId)}
                  disabled={visibleCustomers.length === 0}
                />
              </FormField>
              <FormField label="Linked contact person" htmlFor="deal-contact">
                <FormSelect
                  id="deal-contact"
                  value={form.contactId}
                  onValueChange={(value) => update("contactId", value)}
                  disabled={customerContacts.length === 0}
                  placeholder="Select contact"
                  options={customerContacts.map((contact) => ({
                    value: contact.id,
                    label: `${contact.name}${contact.isPrimary ? " (Primary)" : ""}`,
                  }))}
                />
              </FormField>
            </div>
            <FormField label="OEM segment" htmlFor="deal-oem-segment">
              <Input
                id="deal-oem-segment"
                readOnly
                value={selectedCustomer?.oemSegment ?? ""}
                placeholder="Select a customer"
                className="bg-muted/30"
              />
            </FormField>
          </FormSection>

          <FormSection>
            <div className="space-y-4">
              <FormField label="Product category" htmlFor="deal-product-category">
                <FormSelect
                  id="deal-product-category"
                  value={form.productCategory}
                  onValueChange={(value) => update("productCategory", value)}
                  disabled={masterData.productTypes.length === 0}
                  placeholder="Select category"
                  options={masterData.productTypes.map((type) => ({
                    value: type,
                    label: type,
                  }))}
                />
              </FormField>
              <FormField label="Specific SKU" htmlFor="deal-product">
                <FormSelect
                  id="deal-product"
                  value={form.productId}
                  onValueChange={(value) => {
                    const product = products.find((entry) => entry.id === value);
                    setForm((prev) => ({
                      ...prev,
                      productId: value,
                      quotedPrice: product
                        ? String(product.sellingPrice)
                        : prev.quotedPrice,
                      currentSupplierPrice: product
                        ? String(Math.round(product.sellingPrice * 1.12))
                        : prev.currentSupplierPrice,
                      currentSupplierName: "",
                    }));
                  }}
                  disabled={categoryProducts.length === 0}
                  placeholder="Select SKU"
                  options={categoryProducts.map((product) => ({
                    value: product.id,
                    label: `${product.sku} — ${product.model}`,
                  }))}
                />
              </FormField>
            </div>
            <FormField label="Quantity required (pcs)" htmlFor="deal-quantity">
              <Input
                id="deal-quantity"
                type="number"
                min={1}
                required
                placeholder="e.g. 50000"
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
              />
            </FormField>
            {estimatedValue > 0 ? (
              <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  Estimated annual value (INR)
                  <InfoTip content={HELP.estimatedValue} />
                </span>
                <span className="font-display text-lg font-semibold text-primary">
                  {formatCurrency(estimatedValue)}
                </span>
              </div>
            ) : null}
          </FormSection>

          <FormSection>
            <div className="space-y-4">
              <FormField
                label="Confidence level"
                htmlFor="deal-confidence"
                info={HELP.confidence}
              >
                <FormSelect
                  id="deal-confidence"
                  value={form.confidence}
                  onValueChange={(value) => update("confidence", value)}
                  options={CONFIDENCE_FORM_OPTIONS}
                />
              </FormField>
              <FormField
                label="Current stage"
                htmlFor="deal-stage"
                info={HELP.startingStage}
              >
                <FormSelect
                  id="deal-stage"
                  value={form.stage}
                  onValueChange={(value) => update("stage", value)}
                  options={pipelineStages.map((stage) => ({
                    value: stage.id,
                    label: stage.name,
                  }))}
                />
              </FormField>
            </div>
          </FormSection>
              </TabsContent>

              <TabsContent value="commercial" className="mt-4 space-y-4">
          <FormSection>
            <FormField label="Current supplier" htmlFor="deal-current-supplier">
              <Input
                id="deal-current-supplier"
                value={form.currentSupplierName}
                onChange={(e) => update("currentSupplierName", e.target.value)}
                placeholder="Who supplies this product today"
              />
            </FormField>
            <div className="space-y-4">
              <FormField
                label="Current supplier price (INR/unit)"
                htmlFor="deal-supplier-price"
                info={HELP.supplierPrice}
              >
                <Input
                  id="deal-supplier-price"
                  type="number"
                  min={0}
                  required
                  value={form.currentSupplierPrice}
                  onChange={(e) =>
                    update("currentSupplierPrice", e.target.value)
                  }
                />
              </FormField>
              <FormField label="Our quoted price (INR/unit)" htmlFor="deal-quote">
                <Input
                  id="deal-quote"
                  type="number"
                  min={0}
                  required
                  value={form.quotedPrice}
                  onChange={(e) => update("quotedPrice", e.target.value)}
                />
              </FormField>
              <FormField label="Price advantage (%)" htmlFor="deal-price-advantage">
                <Input
                  id="deal-price-advantage"
                  readOnly
                  value={`${priceAdvantage.toFixed(1)}%`}
                  className="bg-muted/30"
                />
              </FormField>
            </div>
          </FormSection>
              </TabsContent>

              <TabsContent value="followup" className="mt-4 space-y-4">
          <FormSection>
            <div className="space-y-4">
              <FormField label="Next action" htmlFor="deal-next-action">
              <Textarea
                id="deal-next-action"
                rows={2}
                placeholder="e.g. Schedule intro call with procurement team"
                value={form.nextAction}
                onChange={(e) => update("nextAction", e.target.value)}
              />
            </FormField>
            <FormField label="Next action date" htmlFor="deal-next-action-date">
                <DatePicker
                  value={form.nextActionDate}
                  onChange={(value) => update("nextActionDate", value)}
                  placeholder="Select date"
                />
              </FormField>
              <FormField
                label="Deal owner"
                htmlFor="deal-owner"
                info={HELP.dealOwner}
              >
                {canAssign ? (
                  <FormSelect
                    id="deal-owner"
                    value={form.owner}
                    onValueChange={(value) => update("owner", value)}
                    options={masterData.accountOwners.map((owner) => ({
                      value: owner,
                      label: owner,
                    }))}
                  />
                ) : (
                  <Input
                    id="deal-owner"
                    readOnly
                    value={currentUser.name}
                    className="bg-muted/30"
                  />
                )}
              </FormField>
            </div>
          </FormSection>
              </TabsContent>
            </Tabs>
          </div>

          <SheetFooter className="shrink-0 border-t px-6 py-4 sm:justify-end">
            <SheetClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={!canSubmit}>
              Create Deal
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
