"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField as SharedFormField } from "@/components/shared/form-field";
import { FormSection } from "@/components/shared/form-section";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { CustomerSearchSelect } from "@/components/shared/customer-search-select";
import { useCrmData } from "@/lib/crm-data-provider";
import { canAssignDeals } from "@/lib/role-permissions";
import { useAuth } from "@/lib/auth-provider";
import {
  canUserAccessDeal,
  filterCustomersForUser,
} from "@/lib/user-helpers";
import { CONFIDENCE_FORM_OPTIONS } from "@/lib/confidence-constants";
import {
  calculatePriceAdvantage,
  getProductsForCategory,
} from "@/lib/deal-form-helpers";
import { getNextOpenTaskForDeal } from "@/lib/deal-helpers";
import type { ConfidenceLevel, Deal, PipelineStage } from "@/lib/types";
import { formatCurrency, daysSince } from "@/lib/utils";

interface DealSheetProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DealFormValues {
  customerId: string;
  contactId: string;
  productCategory: string;
  productId: string;
  quantity: string;
  currentSupplierName: string;
  currentSupplierPrice: string;
  quotedPrice: string;
  confidence: `${ConfidenceLevel}`;
  stage: PipelineStage;
  owner: string;
  nextAction: string;
  nextActionDate: string;
}

function dealToForm(
  deal: Deal,
  productCategory: string,
  nextTask?: { title: string; dueDate: string }
): DealFormValues {
  return {
    customerId: deal.customerId,
    contactId: deal.contactId,
    productCategory,
    productId: deal.productId,
    quantity: String(deal.quantity),
    currentSupplierName: deal.currentSupplierName,
    currentSupplierPrice: String(deal.currentSupplierPrice),
    quotedPrice: String(deal.quotedPrice),
    confidence: String(deal.confidence) as `${ConfidenceLevel}`,
    stage: deal.stage,
    owner: deal.owner,
    nextAction: nextTask?.title ?? "",
    nextActionDate: nextTask?.dueDate ?? "",
  };
}

export function DealSheet({ deal: dealProp, open, onOpenChange }: DealSheetProps) {
  const { currentUser, users } = useAuth();
  const {
    customers,
    contacts,
    products,
    dealTasks,
    getCustomerById,
    getProductById,
    getDealById,
    getContactsByCustomerId,
    pipelineStages,
    masterData,
    updateDeal,
    addDealTask,
    updateDealTask,
  } = useCrmData();

  const canAssign = canAssignDeals(currentUser.role);

  const deal = dealProp ? getDealById(dealProp.id) ?? dealProp : null;
  const hasAccess =
    !deal || canUserAccessDeal(deal, currentUser, users);

  const visibleCustomers = React.useMemo(
    () => filterCustomersForUser(customers, currentUser, users),
    [customers, currentUser, users]
  );

  const [nextTaskId, setNextTaskId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && deal && !hasAccess) {
      onOpenChange(false);
    }
  }, [open, deal, hasAccess, onOpenChange]);

  const form = useForm<DealFormValues>({
    defaultValues: {
      customerId: "",
      contactId: "",
      productCategory: "",
      productId: "",
      quantity: "",
      currentSupplierName: "",
      currentSupplierPrice: "",
      quotedPrice: "",
      confidence: "25",
      stage: "",
      owner: "",
      nextAction: "",
      nextActionDate: "",
    },
  });

  React.useEffect(() => {
    if (deal && open) {
      const product = getProductById(deal.productId);
      const nextTask = getNextOpenTaskForDeal(dealTasks, deal.id);
      setNextTaskId(nextTask?.id ?? null);
      form.reset(
        dealToForm(deal, product?.motorControllerType ?? "", nextTask)
      );
    }
  }, [deal, open, form, dealTasks, getProductById]);

  const watched = form.watch();
  const customerContacts = watched.customerId
    ? getContactsByCustomerId(watched.customerId)
    : [];
  const selectedCustomer = watched.customerId
    ? getCustomerById(watched.customerId)
    : undefined;
  const categoryProducts = React.useMemo(
    () => getProductsForCategory(products, watched.productCategory),
    [products, watched.productCategory]
  );
  const product = watched.productId
    ? getProductById(watched.productId)
    : undefined;

  const quantity = Number(watched.quantity) || 0;
  const quotedPrice = Number(watched.quotedPrice) || 0;
  const supplierPrice = Number(watched.currentSupplierPrice) || 0;
  const estimatedValue = quantity * quotedPrice;
  const priceAdvantage = calculatePriceAdvantage(supplierPrice, quotedPrice);
  const daysInStage = deal ? daysSince(deal.stageEnteredAt) : 0;

  const handleCustomerChange = (customerId: string) => {
    const customerContactList = getContactsByCustomerId(customerId);
    const primary =
      customerContactList.find((contact) => contact.isPrimary) ??
      customerContactList[0];
    form.setValue("customerId", customerId);
    form.setValue("contactId", primary?.id ?? "");
  };

  const handleProductCategoryChange = (category: string) => {
    form.setValue("productCategory", category);
    const filtered = getProductsForCategory(products, category);
    const currentValid = filtered.some(
      (entry) => entry.id === watched.productId
    );
    if (!currentValid) {
      const nextProduct = filtered[0];
      form.setValue("productId", nextProduct?.id ?? "");
      if (nextProduct) {
        form.setValue("quotedPrice", String(nextProduct.sellingPrice));
        form.setValue(
          "currentSupplierPrice",
          String(Math.round(nextProduct.sellingPrice * 1.12))
        );
      }
    }
  };

  const onSubmit = (values: DealFormValues) => {
    if (!deal) return;

    const qty = Number(values.quantity) || 0;
    const quote = Number(values.quotedPrice) || 0;
    const supplier = Number(values.currentSupplierPrice) || 0;

    updateDeal(deal.id, {
      customerId: values.customerId,
      contactId: values.contactId,
      productId: values.productId,
      quantity: qty,
      currentSupplierName: values.currentSupplierName.trim(),
      currentSupplierPrice: supplier,
      quotedPrice: quote,
      estimatedAnnualValue: qty * quote,
      confidence: Number(values.confidence) as ConfidenceLevel,
      stage: values.stage,
      owner: canAssign ? values.owner : deal.owner,
    });

    const nextAction = values.nextAction.trim();
    const nextActionDate =
      values.nextActionDate || new Date().toISOString().split("T")[0];

    if (nextAction) {
      if (nextTaskId) {
        updateDealTask(nextTaskId, {
          title: nextAction,
          dueDate: nextActionDate,
        });
      } else {
        addDealTask({
          dealId: deal.id,
          title: nextAction,
          dueDate: nextActionDate,
          createdByUserId: currentUser.id,
          assignedToUserId: currentUser.id,
          assignerName: currentUser.name,
        });
      }
    }

    onOpenChange(false);
  };

  const canSave =
    watched.customerId &&
    watched.contactId &&
    watched.productId &&
    quantity > 0 &&
    quotedPrice > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-4 text-left">
          <SheetTitle className="font-display">{deal?.id ?? "Deal"}</SheetTitle>
          <SheetDescription>
            {selectedCustomer?.name && product?.model
              ? `${selectedCustomer.name} — ${product.model}`
              : "View and edit deal details"}
          </SheetDescription>
        </SheetHeader>

        {deal && hasAccess ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
                <FormSection title="Customer">
                  <FormField
                    control={form.control}
                    name="customerId"
                    rules={{ required: "Customer is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer name</FormLabel>
                        <FormControl>
                          <CustomerSearchSelect
                            customers={visibleCustomers}
                            contacts={contacts}
                            value={field.value}
                            onValueChange={handleCustomerChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactId"
                    rules={{ required: "Contact is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Linked contact person</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={customerContacts.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select contact" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customerContacts.map((contact) => (
                              <SelectItem key={contact.id} value={contact.id}>
                                {contact.name}
                                {contact.isPrimary ? " (Primary)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <SharedFormField label="OEM segment" htmlFor="deal-oem-segment">
                    <Input
                      id="deal-oem-segment"
                      readOnly
                      value={selectedCustomer?.oemSegment ?? ""}
                      placeholder="Select a customer"
                      className="bg-muted/30"
                    />
                  </SharedFormField>
                </FormSection>

                <FormSection title="Product selection">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="productCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product category</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={handleProductCategoryChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {masterData.productTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="productId"
                      rules={{ required: "Product is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specific SKU</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              const selected = products.find(
                                (entry) => entry.id === value
                              );
                              field.onChange(value);
                              if (selected) {
                                form.setValue(
                                  "quotedPrice",
                                  String(selected.sellingPrice)
                                );
                              }
                            }}
                            disabled={categoryProducts.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select SKU" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categoryProducts.map((entry) => (
                                <SelectItem key={entry.id} value={entry.id}>
                                  {entry.sku} — {entry.model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="quantity"
                    rules={{
                      required: "Quantity is required",
                      validate: (value) =>
                        Number(value) > 0 || "Quantity must be greater than 0",
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity required (pcs)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {estimatedValue > 0 ? (
                    <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                      <span className="text-muted-foreground">
                        Estimated annual value (INR)
                      </span>
                      <span className="font-display font-semibold text-primary">
                        {formatCurrency(estimatedValue)}
                      </span>
                    </div>
                  ) : null}
                </FormSection>

                <FormSection title="Pricing">
                  <FormField
                    control={form.control}
                    name="currentSupplierName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current supplier</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Who supplies this product today"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currentSupplierPrice"
                    rules={{ required: "Supplier price is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current supplier price (INR/unit)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quotedPrice"
                    rules={{
                      required: "Quote is required",
                      validate: (value) =>
                        Number(value) > 0 || "Quote must be greater than 0",
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Our quoted price (INR/unit)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <SharedFormField
                    label="Price advantage (%)"
                    htmlFor="deal-price-advantage"
                  >
                    <Input
                      id="deal-price-advantage"
                      readOnly
                      value={`${priceAdvantage.toFixed(1)}%`}
                      className="bg-muted/30"
                    />
                  </SharedFormField>
                  </div>
                </FormSection>

                <FormSection title="Pipeline">
                  <FormField
                    control={form.control}
                    name="confidence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confidence level</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select confidence" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CONFIDENCE_FORM_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current stage</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pipelineStages.map((stage) => (
                              <SelectItem key={stage.id} value={stage.id}>
                                {stage.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {daysInStage} days in current stage
                          {watched.stage !== deal.stage && " · will update on save"}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormSection>

                <FormSection title="Log">
                  <FormField
                    control={form.control}
                    name="nextAction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next action</FormLabel>
                        <FormControl>
                          <Textarea rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nextActionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next action date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="owner"
                    rules={{ required: "Owner is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deal owner</FormLabel>
                        {canAssign ? (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select owner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {masterData.accountOwners.map((owner) => (
                                <SelectItem key={owner} value={owner}>
                                  {owner}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            readOnly
                            value={field.value}
                            className="bg-muted/30"
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormSection>
              </div>

              <SheetFooter className="shrink-0 border-t px-6 py-4 sm:justify-end">
                <SheetClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </SheetClose>
                <Button type="submit" disabled={!canSave}>
                  Save Changes
                </Button>
              </SheetFooter>
            </form>
          </Form>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
