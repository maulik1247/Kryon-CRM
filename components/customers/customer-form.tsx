"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RecordFormPage } from "@/components/records/record-form-page";
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
import { FormSection } from "@/components/shared/form-section";
import { useAuth } from "@/lib/auth-provider";
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
import { recordListRoutes } from "@/lib/record-routes";
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
  existing?: Customer,
  createdByUserId?: string
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
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    createdByUserId:
      existing?.createdByUserId ?? createdByUserId ?? "user-admin",
  };
}

interface CustomerFormProps {
  customerId?: string;
}

export function CustomerForm({ customerId }: CustomerFormProps) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const {
    masterData,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    getContactsByCustomerId,
    getDealsByCustomerId,
  } = useCrmData();

  const customer = customerId ? getCustomerById(customerId) : null;
  const isAdd = !customerId;
  const defaultOwner = masterData.accountOwners[0] ?? "";

  const form = useForm<CustomerFormState>({
    defaultValues: emptyForm(defaultOwner),
  });

  React.useEffect(() => {
    form.reset(
      customer ? customerToForm(customer) : emptyForm(defaultOwner)
    );
  }, [customer, form, defaultOwner]);

  const vendorStatus = form.watch("vendorStatus");
  const customerProducts = form.watch("customerProducts");
  const plantLocations = form.watch("plantLocations");
  const registrationDocuments = form.watch("registrationDocuments");
  const vendorApproved = vendorStatus === "Approved";

  const onSubmit = (values: CustomerFormState) => {
    if (!isValidGstin(values.gstin)) {
      form.setError("gstin", {
        message: "Enter a valid 15-character GSTIN.",
      });
      return;
    }

    if (isAdd) {
      const id = `cust-${Date.now()}`;
      addCustomer(
        formToCustomer(values, id, undefined, currentUser.id)
      );
      router.push(recordListRoutes.customer);
      return;
    }

    if (!customer) return;
    updateCustomer(customer.id, formToCustomer(values, customer.id, customer));
    router.push(recordListRoutes.customer);
  };

  const handleDelete = () => {
    if (!customer) return;
    const removed = deleteCustomer(customer.id);
    if (removed) router.push(recordListRoutes.customer);
  };

  if (!isAdd && !customer) {
    return null;
  }

  const linkedContacts = customer
    ? getContactsByCustomerId(customer.id).length
    : 0;
  const linkedDeals = customer ? getDealsByCustomerId(customer.id).length : 0;

  return (
    <RecordFormPage
      backHref={recordListRoutes.customer}
      backLabel="Customers"
      title={isAdd ? "Add Customer" : "Edit Customer"}
      description={
        isAdd
          ? "Create a new customer record in the master."
          : "Update customer details, plants, documents, and products."
      }
      onSubmit={form.handleSubmit(onSubmit)}
      footer={
        <>
          {!isAdd ? (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href={recordListRoutes.customer}>Cancel</Link>
            </Button>
            <Button type="submit">
              {isAdd ? "Save Customer" : "Save Changes"}
            </Button>
          </div>
        </>
      }
    >
      <Form {...form}>
        <div className="space-y-8">
          <FormSection title="Details">
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
                        <FormLabel optional>Notes</FormLabel>
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

                  {customer ? (
                    <p className="text-xs text-muted-foreground">
                      {linkedContacts} contact
                      {linkedContacts === 1 ? "" : "s"} · {linkedDeals} deal
                      {linkedDeals === 1 ? "" : "s"}
                    </p>
                  ) : null}
          </FormSection>

          <FormSection title="Plant locations">
            <CustomerPlantLocationsEditor
              value={plantLocations}
              onChange={(next) => form.setValue("plantLocations", next)}
            />
          </FormSection>

          <FormSection title="Registration documents">
            <CustomerDocumentsEditor
              value={registrationDocuments}
              onChange={(next) =>
                form.setValue("registrationDocuments", next)
              }
            />
          </FormSection>

          <FormSection title="Customer products">
            <CustomerProductDetailsEditor
              value={customerProducts}
              onChange={(next) =>
                form.setValue("customerProducts", next)
              }
            />
          </FormSection>
        </div>
      </Form>
    </RecordFormPage>
  );
}
