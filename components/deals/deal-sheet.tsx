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
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
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
import { useCrmData } from "@/lib/crm-data-provider";
import type { Deal, PipelineStage } from "@/lib/types";
import { formatCurrency, daysSince } from "@/lib/utils";

interface DealSheetProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DealFormValues {
  customerId: string;
  contactId: string;
  productId: string;
  quantity: string;
  currentSupplierPrice: string;
  quotedPrice: string;
  stage: PipelineStage;
  owner: string;
}

function dealToForm(deal: Deal): DealFormValues {
  return {
    customerId: deal.customerId,
    contactId: deal.contactId,
    productId: deal.productId,
    quantity: String(deal.quantity),
    currentSupplierPrice: String(deal.currentSupplierPrice),
    quotedPrice: String(deal.quotedPrice),
    stage: deal.stage,
    owner: deal.owner,
  };
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
        {title}
      </Label>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function DealSheet({ deal: dealProp, open, onOpenChange }: DealSheetProps) {
  const {
    customers,
    products,
    getCustomerById,
    getProductById,
    getDealById,
    getContactsByCustomerId,
    pipelineStages,
    masterData,
    updateDeal,
  } = useCrmData();

  const deal = dealProp ? getDealById(dealProp.id) ?? dealProp : null;

  const form = useForm<DealFormValues>({
    defaultValues: {
      customerId: "",
      contactId: "",
      productId: "",
      quantity: "",
      currentSupplierPrice: "",
      quotedPrice: "",
      stage: "",
      owner: "",
    },
  });

  React.useEffect(() => {
    if (deal && open) {
      form.reset(dealToForm(deal));
    }
  }, [deal, open, form]);

  const watched = form.watch();
  const customerContacts = watched.customerId
    ? getContactsByCustomerId(watched.customerId)
    : [];
  const product = watched.productId
    ? getProductById(watched.productId)
    : undefined;
  const customer = watched.customerId
    ? getCustomerById(watched.customerId)
    : undefined;

  const quantity = Number(watched.quantity) || 0;
  const quotedPrice = Number(watched.quotedPrice) || 0;
  const supplierPrice = Number(watched.currentSupplierPrice) || 0;
  const estimatedValue = quantity * quotedPrice;
  const priceAdvantage =
    supplierPrice > 0
      ? ((supplierPrice - quotedPrice) / supplierPrice) * 100
      : 0;
  const daysInStage = deal ? daysSince(deal.stageEnteredAt) : 0;

  const handleCustomerChange = (customerId: string) => {
    const contacts = getContactsByCustomerId(customerId);
    const primary = contacts.find((c) => c.isPrimary) ?? contacts[0];
    form.setValue("customerId", customerId);
    form.setValue("contactId", primary?.id ?? "");
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
      currentSupplierPrice: supplier,
      quotedPrice: quote,
      estimatedAnnualValue: qty * quote,
      confidence: deal.confidence,
      stage: values.stage,
      owner: values.owner,
    });

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
            {customer?.name && product?.model
              ? `${customer.name} — ${product.model}`
              : "View and edit deal details"}
          </SheetDescription>
        </SheetHeader>

        {deal ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
                <FormSection title="Opportunity">
                  <FormField
                    control={form.control}
                    name="customerId"
                    rules={{ required: "Customer is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={handleCustomerChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
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
                    name="contactId"
                    rules={{ required: "Contact is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact</FormLabel>
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
                            {customerContacts.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                                {c.isPrimary ? " (Primary)" : ""}
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
                        <FormLabel>Product</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.sku} — {p.model}
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
                    name="quantity"
                    rules={{
                      required: "Quantity is required",
                      validate: (v) =>
                        Number(v) > 0 || "Quantity must be greater than 0",
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {estimatedValue > 0 && (
                    <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm">
                      <span className="text-muted-foreground">
                        Est. annual value
                      </span>
                      <span className="font-display font-semibold text-primary">
                        {formatCurrency(estimatedValue)}
                      </span>
                    </div>
                  )}
                </FormSection>

                <Separator />

                <FormSection title="Pricing">
                  <FormField
                    control={form.control}
                    name="currentSupplierPrice"
                    rules={{ required: "Supplier price is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier Price (₹)</FormLabel>
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
                      validate: (v) =>
                        Number(v) > 0 || "Quote must be greater than 0",
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Our Quote (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <Label>Price Advantage</Label>
                    <Input
                      readOnly
                      value={`${priceAdvantage.toFixed(1)}%`}
                      className="bg-muted/50"
                    />
                  </div>
                </FormSection>

                <Separator />

                <FormSection title="Deal Stage">
                  <FormField
                    control={form.control}
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stage</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="owner"
                    rules={{ required: "Owner is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deal Owner</FormLabel>
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
