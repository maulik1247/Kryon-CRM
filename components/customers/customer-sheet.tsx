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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FormSection } from "@/components/shared/form-section";
import { useCrmData } from "@/lib/crm-data-provider";
import {
  formatLeadDate,
  isValidGstin,
  PRIORITIES,
  TIERS,
  VENDOR_STATUSES,
} from "@/lib/customer-constants";
import { CustomerProductDetailsEditor } from "./customer-product-details-editor";
import { CustomerPlantLocationsEditor } from "./customer-plant-locations-editor";
import { CustomerDocumentsEditor } from "./customer-documents-editor";
import type {
  Customer,
  CustomerProductDetails,
  LeadSource,
  OemSegment,
  Priority,
  RegistrationDocument,
  Tier,
  VendorStatus,
} from "@/lib/types";

interface CustomerFormState {
  name: string;
  oemSegment: OemSegment | "";
  leadSource: LeadSource | "";
  plantLocations: string[];
  gstin: string;
  websiteUrl: string;
  vendorStatus: VendorStatus;
  vendorCode: string;
  priority: Priority;
  accountOwner: string;
  tier: Tier;
  notes: string;
  registrationDocuments: RegistrationDocument[];
  customerProducts: CustomerProductDetails[];
}

function emptyForm(defaultOwner: string): CustomerFormState {
  return {
    name: "",
    oemSegment: "",
    leadSource: "",
    plantLocations: [""],
    gstin: "",
    websiteUrl: "",
    vendorStatus: "Not Started",
    vendorCode: "",
    priority: "B",
    accountOwner: defaultOwner,
    tier: "Tier 2",
    notes: "",
    registrationDocuments: [],
    customerProducts: [],
  };
}

function customerToForm(customer: Customer): CustomerFormState {
  return {
    name: customer.name,
    oemSegment: customer.oemSegment,
    leadSource: customer.leadSource,
    plantLocations:
      customer.plantLocations.length > 0 ? customer.plantLocations : [""],
    gstin: customer.gstin,
    websiteUrl: customer.websiteUrl,
    vendorStatus: customer.vendorStatus,
    vendorCode: customer.vendorCode,
    priority: customer.priority,
    accountOwner: customer.accountOwner,
    tier: customer.tier,
    notes: customer.notes,
    registrationDocuments: customer.registrationDocuments,
    customerProducts: customer.customerProducts ?? [],
  };
}

function formToCustomer(
  form: CustomerFormState,
  id: string,
  existing?: Customer
): Customer {
  const vendorCode =
    form.vendorStatus === "Approved" ? form.vendorCode.trim() : "";

  return {
    id,
    name: form.name.trim(),
    oemSegment: (form.oemSegment || "Other") as OemSegment,
    leadSource: (form.leadSource || "Other") as LeadSource,
    leadDate: existing?.leadDate ?? formatLeadDate(),
    plantLocations: form.plantLocations.map((line) => line.trim()).filter(Boolean),
    productionCapacity: existing?.productionCapacity ?? "",
    annualRevenueRange: existing?.annualRevenueRange ?? "",
    gstin: form.gstin.trim().toUpperCase(),
    websiteUrl: form.websiteUrl.trim(),
    registeredOfficeAddress: existing?.registeredOfficeAddress ?? "",
    factoryAddress: existing?.factoryAddress ?? "",
    vendorStatus: form.vendorStatus,
    registrationFormSubmittedDate: existing?.registrationFormSubmittedDate ?? "",
    expectedApprovalDate: existing?.expectedApprovalDate ?? "",
    vendorCode,
    registrationDocuments: form.registrationDocuments,
    registrationRemarks: existing?.registrationRemarks ?? "",
    priority: form.priority,
    accountOwner: form.accountOwner.trim(),
    tier: form.tier,
    estimatedAnnualPotential: existing?.estimatedAnnualPotential ?? "",
    notes: form.notes.trim(),
    customerProducts: form.customerProducts,
  };
}

interface CustomerSheetProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerSheet({
  customer: customerProp,
  open,
  onOpenChange,
}: CustomerSheetProps) {
  const {
    masterData,
    addCustomer,
    updateCustomer,
    getCustomerById,
    getContactsByCustomerId,
    getDealsByCustomerId,
  } = useCrmData();

  const customer = customerProp
    ? getCustomerById(customerProp.id) ?? customerProp
    : null;
  const isAdd = !customerProp;
  const defaultOwner = masterData.accountOwners[0] ?? "";

  const [activeTab, setActiveTab] = React.useState("details");

  const form = useForm<CustomerFormState>({
    defaultValues: emptyForm(defaultOwner),
  });

  React.useEffect(() => {
    if (open) {
      setActiveTab("details");
      form.reset(
        customer
          ? customerToForm(customer)
          : emptyForm(defaultOwner)
      );
    }
  }, [open, customer, form, defaultOwner]);

  const vendorStatus = form.watch("vendorStatus");
  const customerProducts = form.watch("customerProducts");
  const plantLocations = form.watch("plantLocations");
  const registrationDocuments = form.watch("registrationDocuments");
  const vendorApproved = vendorStatus === "Approved";

  const plantCount = plantLocations.filter((location) => location.trim()).length;
  const documentCount = registrationDocuments.length;

  const onSubmit = (values: CustomerFormState) => {
    if (!isValidGstin(values.gstin)) {
      form.setError("gstin", {
        message: "Enter a valid 15-character GSTIN.",
      });
      setActiveTab("details");
      return;
    }

    if (isAdd) {
      addCustomer(formToCustomer(values, `cust-${Date.now()}`));
    } else if (customer) {
      updateCustomer(
        customer.id,
        formToCustomer(values, customer.id, customer)
      );
    }

    onOpenChange(false);
  };

  const linkedContacts = customer
    ? getContactsByCustomerId(customer.id).length
    : 0;
  const linkedDeals = customer ? getDealsByCustomerId(customer.id).length : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-4 text-left">
          <SheetTitle className="font-display">
            {isAdd ? "Add Customer" : customer?.name ?? "Customer"}
          </SheetTitle>
          <SheetDescription>
            {isAdd
              ? "Create a new customer record."
              : "Update customer details and products."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid h-auto w-full shrink-0 grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="plants">
                    Plants
                    {plantCount > 0 ? (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({plantCount})
                      </span>
                    ) : null}
                  </TabsTrigger>
                  <TabsTrigger value="documents">
                    Docs
                    {documentCount > 0 ? (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({documentCount})
                      </span>
                    ) : null}
                  </TabsTrigger>
                  <TabsTrigger value="products">
                    Products
                    {customerProducts.length > 0 ? (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({customerProducts.length})
                      </span>
                    ) : null}
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="details"
                  className="mt-4 space-y-4 data-[state=inactive]:hidden"
                >
                  <FormSection>
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: "Company name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company name</FormLabel>
                        <FormControl>
                          <Input placeholder="Customer / company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="oemSegment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OEM segment</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {masterData.oemSegments.map((segment) => (
                                <SelectItem key={segment} value={segment}>
                                  {segment}
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
                      name="leadSource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lead source</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {masterData.leadSources.map((source) => (
                                <SelectItem key={source} value={source}>
                                  {source}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PRIORITIES.map((priority) => (
                                <SelectItem
                                  key={priority.value}
                                  value={priority.value}
                                >
                                  {priority.label}
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
                      name="tier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tier</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TIERS.map((tier) => (
                                <SelectItem key={tier} value={tier}>
                                  {tier}
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
                      name="accountOwner"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account owner</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
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
                  </div>

                  <FormField
                    control={form.control}
                    name="gstin"
                    rules={{
                      validate: (value) =>
                        isValidGstin(value) ||
                        "Enter a valid 15-character GSTIN.",
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GSTIN</FormLabel>
                        <FormControl>
                          <Input
                            maxLength={15}
                            placeholder="22AAAAA0000A1Z5"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value.toUpperCase())
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="websiteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="vendorStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor status</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value as VendorStatus);
                              if (value !== "Approved") {
                                form.setValue("vendorCode", "");
                              }
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {VENDOR_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
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
                      name="vendorCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor code</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!vendorApproved}
                              placeholder={
                                vendorApproved ? "Enter code" : "After approval"
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            placeholder="Key context, pain points, pricing notes"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  </FormSection>

                  {customer ? (
                    <p className="text-xs text-muted-foreground">
                      {linkedContacts} contact
                      {linkedContacts === 1 ? "" : "s"} · {linkedDeals} deal
                      {linkedDeals === 1 ? "" : "s"}
                    </p>
                  ) : null}
                </TabsContent>

                <TabsContent
                  value="plants"
                  className="mt-4 space-y-4 data-[state=inactive]:hidden"
                >
                  <CustomerPlantLocationsEditor
                    value={plantLocations}
                    onChange={(next) => form.setValue("plantLocations", next)}
                  />
                </TabsContent>

                <TabsContent
                  value="documents"
                  className="mt-4 space-y-4 data-[state=inactive]:hidden"
                >
                  <CustomerDocumentsEditor
                    value={registrationDocuments}
                    onChange={(next) =>
                      form.setValue("registrationDocuments", next)
                    }
                  />
                </TabsContent>

                <TabsContent
                  value="products"
                  className="mt-4 space-y-4 data-[state=inactive]:hidden"
                >
                  <CustomerProductDetailsEditor
                    value={customerProducts}
                    onChange={(next) =>
                      form.setValue("customerProducts", next)
                    }
                  />
                </TabsContent>
              </Tabs>
            </div>

            <SheetFooter className="shrink-0 border-t px-6 py-4 sm:justify-end">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit">
                {isAdd ? "Save customer" : "Save changes"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
