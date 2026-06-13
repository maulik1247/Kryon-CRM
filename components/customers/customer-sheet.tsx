"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2, Upload } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  ANNUAL_REVENUE_RANGES,
  formatLeadDate,
  isValidGstin,
  PRIORITIES,
  TIERS,
  VENDOR_STATUSES,
} from "@/lib/customer-constants";
import { CustomerProductDetailsEditor } from "./customer-product-details-editor";
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
  leadDate: string;
  plantLocations: string[];
  productionCapacity: string;
  annualRevenueRange: string;
  gstin: string;
  websiteUrl: string;
  registeredOfficeAddress: string;
  factoryAddress: string;
  vendorStatus: VendorStatus;
  registrationFormSubmittedDate: string;
  expectedApprovalDate: string;
  vendorCode: string;
  registrationDocuments: RegistrationDocument[];
  registrationRemarks: string;
  priority: Priority;
  accountOwner: string;
  tier: Tier;
  estimatedAnnualPotential: string;
  notes: string;
  customerProducts: CustomerProductDetails[];
}

const emptyForm: CustomerFormState = {
  name: "",
  oemSegment: "",
  leadSource: "",
  leadDate: formatLeadDate(),
  plantLocations: [""],
  productionCapacity: "",
  annualRevenueRange: "",
  gstin: "",
  websiteUrl: "",
  registeredOfficeAddress: "",
  factoryAddress: "",
  vendorStatus: "Not Started",
  registrationFormSubmittedDate: "",
  expectedApprovalDate: "",
  vendorCode: "",
  registrationDocuments: [],
  registrationRemarks: "",
  priority: "B",
  accountOwner: "",
  tier: "Tier 2",
  estimatedAnnualPotential: "",
  notes: "",
  customerProducts: [],
};

function customerToForm(customer: Customer): CustomerFormState {
  return {
    name: customer.name,
    oemSegment: customer.oemSegment,
    leadSource: customer.leadSource,
    leadDate: customer.leadDate,
    plantLocations:
      customer.plantLocations.length > 0 ? customer.plantLocations : [""],
    productionCapacity: customer.productionCapacity,
    annualRevenueRange: customer.annualRevenueRange,
    gstin: customer.gstin,
    websiteUrl: customer.websiteUrl,
    registeredOfficeAddress: customer.registeredOfficeAddress,
    factoryAddress: customer.factoryAddress,
    vendorStatus: customer.vendorStatus,
    registrationFormSubmittedDate: customer.registrationFormSubmittedDate,
    expectedApprovalDate: customer.expectedApprovalDate,
    vendorCode: customer.vendorCode,
    registrationDocuments: customer.registrationDocuments,
    registrationRemarks: customer.registrationRemarks,
    priority: customer.priority,
    accountOwner: customer.accountOwner,
    tier: customer.tier,
    estimatedAnnualPotential: customer.estimatedAnnualPotential,
    notes: customer.notes,
    customerProducts: customer.customerProducts ?? [],
  };
}

function formToCustomer(form: CustomerFormState, id: string): Customer {
  const vendorCode =
    form.vendorStatus === "Approved" ? form.vendorCode.trim() : "";

  return {
    id,
    name: form.name.trim(),
    oemSegment: (form.oemSegment || "Other") as OemSegment,
    leadSource: (form.leadSource || "Other") as LeadSource,
    leadDate: form.leadDate || formatLeadDate(),
    plantLocations: form.plantLocations.map((l) => l.trim()).filter(Boolean),
    productionCapacity: form.productionCapacity.trim(),
    annualRevenueRange: form.annualRevenueRange as Customer["annualRevenueRange"],
    gstin: form.gstin.trim().toUpperCase(),
    websiteUrl: form.websiteUrl.trim(),
    registeredOfficeAddress: form.registeredOfficeAddress.trim(),
    factoryAddress: form.factoryAddress.trim(),
    vendorStatus: form.vendorStatus,
    registrationFormSubmittedDate: form.registrationFormSubmittedDate,
    expectedApprovalDate: form.expectedApprovalDate,
    vendorCode,
    registrationDocuments: form.registrationDocuments,
    registrationRemarks: form.registrationRemarks.trim(),
    priority: form.priority,
    accountOwner: form.accountOwner.trim(),
    tier: form.tier,
    estimatedAnnualPotential: form.estimatedAnnualPotential.trim(),
    notes: form.notes.trim(),
    customerProducts: form.customerProducts,
  };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-sm font-semibold tracking-tight text-foreground">
      {children}
    </h3>
  );
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

  const form = useForm<CustomerFormState>({
    defaultValues: emptyForm,
  });

  React.useEffect(() => {
    if (open) {
      form.reset(
        customer
          ? customerToForm(customer)
          : { ...emptyForm, leadDate: formatLeadDate() }
      );
    }
  }, [open, customer, form]);

  const plantLocations = form.watch("plantLocations");
  const registrationDocuments = form.watch("registrationDocuments");
  const customerProducts = form.watch("customerProducts");
  const vendorStatus = form.watch("vendorStatus");
  const vendorApproved = vendorStatus === "Approved";

  const updatePlantLocation = (index: number, value: string) => {
    const next = [...plantLocations];
    next[index] = value;
    form.setValue("plantLocations", next);
  };

  const addPlantLocation = () => {
    form.setValue("plantLocations", [...plantLocations, ""]);
  };

  const removePlantLocation = (index: number) => {
    form.setValue(
      "plantLocations",
      plantLocations.filter((_, i) => i !== index)
    );
  };

  const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const accepted = files.filter((file) =>
      /\.(pdf|doc|docx|jpg|jpeg)$/i.test(file.name)
    );

    form.setValue("registrationDocuments", [
      ...registrationDocuments,
      ...accepted.map((file) => ({
        id: `doc-${Date.now()}-${file.name}`,
        name: file.name,
        size: file.size,
      })),
    ]);

    e.target.value = "";
  };

  const removeDocument = (id: string) => {
    form.setValue(
      "registrationDocuments",
      registrationDocuments.filter((doc) => doc.id !== id)
    );
  };

  const onSubmit = (values: CustomerFormState) => {
    if (!isValidGstin(values.gstin)) {
      form.setError("gstin", {
        message: "Enter a valid 15-character GSTIN.",
      });
      return;
    }

    if (isAdd) {
      addCustomer(formToCustomer(values, `cust-${Date.now()}`));
    } else if (customer) {
      updateCustomer(customer.id, formToCustomer(values, customer.id));
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
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-4 text-left">
          <SheetTitle className="font-display">
            {isAdd ? "Customer Master" : customer?.name ?? "Customer Master"}
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            {isAdd ? "New customer record" : "Edit customer record"}
          </p>
          <SheetDescription>
            Central record for each OEM customer with full company profile.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
              <section className="space-y-4">
                <SectionTitle>Company Information</SectionTitle>

                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: "Company name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer / Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <FormLabel>OEM Segment</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select segment" />
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
                        <FormLabel>Lead Source</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
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

                <FormField
                  control={form.control}
                  name="leadDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isAdd}
                          placeholder="Pick lead date"
                        />
                      </FormControl>
                      {isAdd && (
                        <FormDescription>
                          Auto-captured on creation
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Plant Location(s)</Label>
                  {plantLocations.map((location, index) => (
                    <div key={`plant-${index}`} className="flex gap-2">
                      <Input
                        value={location}
                        placeholder="City, state"
                        onChange={(e) =>
                          updatePlantLocation(index, e.target.value)
                        }
                      />
                      {plantLocations.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removePlantLocation(index)}
                          aria-label="Remove plant location"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPlantLocation}
                  >
                    <Plus className="h-4 w-4" />
                    Add plant
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="productionCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Production Capacity (units/yr)</FormLabel>
                        <FormControl>
                          <Input inputMode="numeric" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="annualRevenueRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Revenue Range</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ANNUAL_REVENUE_RANGES.map((range) => (
                              <SelectItem key={range} value={range}>
                                {range}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
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
                        <FormLabel>Website URL</FormLabel>
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
                </div>

                <FormField
                  control={form.control}
                  name="registeredOfficeAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address — Registered Office</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="factoryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address — Factory / Plant</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <Separator />

              <section className="space-y-4">
                <SectionTitle>Vendor Registration</SectionTitle>

                <FormField
                  control={form.control}
                  name="vendorStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Registration Status</FormLabel>
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="registrationFormSubmittedDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Form Submitted Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Pick submitted date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expectedApprovalDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Approval Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Pick expected date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="vendorCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Code</FormLabel>
                      <FormControl>
                        <Input
                          disabled={!vendorApproved}
                          placeholder={
                            vendorApproved
                              ? "Enter vendor code"
                              : "Available after approval"
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label htmlFor="registrationDocuments">
                    Registration Documents
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <label
                        htmlFor="registrationDocuments"
                        className="cursor-pointer"
                      >
                        <Upload className="h-4 w-4" />
                        Upload files
                      </label>
                    </Button>
                    <Input
                      id="registrationDocuments"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg"
                      multiple
                      className="hidden"
                      onChange={handleDocumentsChange}
                    />
                    <span className="text-xs text-muted-foreground">
                      PDF, DOC, JPG — multiple files
                    </span>
                  </div>
                  {registrationDocuments.length > 0 && (
                    <ul className="space-y-2">
                      {registrationDocuments.map((doc) => (
                        <li
                          key={doc.id}
                          className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                        >
                          <span className="truncate">{doc.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDocument(doc.id)}
                            aria-label={`Remove ${doc.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="registrationRemarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Remarks</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <Separator />

              <section className="space-y-4">
                <SectionTitle>Customer Classification</SectionTitle>

                <div className="grid gap-4 sm:grid-cols-2">
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
                    name="accountOwner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Owner</FormLabel>
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
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="tier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Tier</FormLabel>
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
                    name="estimatedAnnualPotential"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Annual Potential (INR)</FormLabel>
                        <FormControl>
                          <Input inputMode="numeric" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <CustomerProductDetailsEditor
                  value={customerProducts}
                  onChange={(next) => form.setValue("customerProducts", next)}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Pain points, target price, key information"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              {customer && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                      Linked records
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {linkedContacts} contact
                      {linkedContacts === 1 ? "" : "s"} · {linkedDeals} deal
                      {linkedDeals === 1 ? "" : "s"}
                    </p>
                  </div>
                </>
              )}
            </div>

            <SheetFooter className="shrink-0 border-t px-6 py-4 sm:justify-end">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit">
                {isAdd ? "Save Customer" : "Save Changes"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
