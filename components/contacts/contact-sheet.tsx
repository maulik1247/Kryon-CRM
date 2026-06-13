"use client";

import * as React from "react";
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
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "@/components/shared/form-field";
import { FormSelect } from "@/components/shared/form-select";
import { useCrmData } from "@/lib/crm-data-provider";
import {
  BUYING_ROLES,
  CONTACT_DEPARTMENTS,
  PRIMARY_CONTACT_OPTIONS,
} from "@/lib/contact-constants";
import type { BuyingRole, Contact, ContactDepartment } from "@/lib/types";

interface ContactFormState {
  name: string;
  designation: string;
  department: ContactDepartment;
  customerId: string;
  phone: string;
  email: string;
  officePhone: string;
  buyingRole: BuyingRole;
  reportsTo: string;
  isPrimary: "yes" | "no";
  linkedInUrl: string;
  birthdayOrAnniversary: string;
  notes: string;
}

const emptyForm = (customerId: string): ContactFormState => ({
  name: "",
  designation: "",
  department: "R&D",
  customerId,
  phone: "",
  email: "",
  officePhone: "",
  buyingRole: "Influencer",
  reportsTo: "",
  isPrimary: "no",
  linkedInUrl: "",
  birthdayOrAnniversary: "",
  notes: "",
});

function contactToForm(contact: Contact): ContactFormState {
  return {
    name: contact.name,
    designation: contact.designation,
    department: contact.department,
    customerId: contact.customerId,
    phone: contact.phone,
    email: contact.email,
    officePhone: contact.officePhone ?? "",
    buyingRole: contact.buyingRole,
    reportsTo: contact.reportsTo ?? "",
    isPrimary: contact.isPrimary ? "yes" : "no",
    linkedInUrl: contact.linkedInUrl ?? "",
    birthdayOrAnniversary: contact.birthdayOrAnniversary ?? "",
    notes: contact.notes ?? "",
  };
}

function formToContact(form: ContactFormState, id: string): Contact {
  return {
    id,
    customerId: form.customerId,
    name: form.name.trim(),
    designation: form.designation.trim(),
    department: form.department,
    phone: form.phone.trim(),
    email: form.email.trim(),
    officePhone: form.officePhone.trim() || undefined,
    buyingRole: form.buyingRole,
    reportsTo: form.reportsTo.trim() || undefined,
    isPrimary: form.isPrimary === "yes",
    linkedInUrl: form.linkedInUrl.trim() || undefined,
    birthdayOrAnniversary: form.birthdayOrAnniversary || undefined,
    notes: form.notes.trim() || undefined,
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
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

interface ContactSheetProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactSheet({
  contact: contactProp,
  open,
  onOpenChange,
}: ContactSheetProps) {
  const {
    customers,
    addContact,
    updateContact,
    getContactById,
    getCustomerById,
    getContactsByCustomerId,
  } = useCrmData();

  const contact = contactProp
    ? getContactById(contactProp.id) ?? contactProp
    : null;
  const isAdd = !contactProp;
  const [form, setForm] = React.useState<ContactFormState>(
    emptyForm(customers[0]?.id ?? "")
  );

  React.useEffect(() => {
    if (open) {
      setForm(
        contact
          ? contactToForm(contact)
          : emptyForm(customers[0]?.id ?? "")
      );
    }
  }, [open, contact, customers]);

  const update = (field: keyof ContactFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isAdd) {
      addContact(formToContact(form, `cont-${Date.now()}`));
    } else if (contact) {
      updateContact(contact.id, formToContact(form, contact.id));
    }

    onOpenChange(false);
  };

  const customer = getCustomerById(form.customerId);
  const reportOptions = getContactsByCustomerId(form.customerId).filter(
    (entry) => entry.id !== contact?.id
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-4 text-left">
          <SheetTitle className="font-display">
            {isAdd ? "Add Contact" : contact?.name ?? "Contact"}
          </SheetTitle>
          <SheetDescription>
            {isAdd
              ? "Add a decision maker or influencer linked to a customer account."
              : `${customer?.name ?? "Customer"} · ${contact?.designation ?? ""}`}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
            <FormSection
              title="Person & Account"
              description="Multiple contacts per customer across R&D, Purchase, VD, Quality, and Management."
            >
              <FormField label="Contact Name" htmlFor="contact-name">
                <Input
                  id="contact-name"
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </FormField>
              <FormField label="Designation / Title" htmlFor="designation">
                <Input
                  id="designation"
                  required
                  value={form.designation}
                  onChange={(e) => update("designation", e.target.value)}
                />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Department" htmlFor="department">
                  <FormSelect
                    id="department"
                    value={form.department}
                    onValueChange={(v) =>
                      update("department", v as ContactDepartment)
                    }
                    options={CONTACT_DEPARTMENTS.map((department) => ({
                      value: department,
                      label: department,
                    }))}
                  />
                </FormField>
                <FormField label="Customer" htmlFor="customerId">
                  <FormSelect
                    id="customerId"
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
              </div>
            </FormSection>

            <Separator />

            <FormSection title="Contact Details">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Phone (Mobile)" htmlFor="phone">
                  <Input
                    id="phone"
                    required
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </FormField>
                <FormField label="Email" htmlFor="email">
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </FormField>
              </div>
              <FormField
                label="Phone (Office / Landline)"
                htmlFor="officePhone"
              >
                <Input
                  id="officePhone"
                  value={form.officePhone}
                  onChange={(e) => update("officePhone", e.target.value)}
                  placeholder="Optional"
                />
              </FormField>
              <FormField label="LinkedIn Profile URL" htmlFor="linkedInUrl">
                <Input
                  id="linkedInUrl"
                  type="url"
                  value={form.linkedInUrl}
                  onChange={(e) => update("linkedInUrl", e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </FormField>
            </FormSection>

            <Separator />

            <FormSection title="Buying & Relationship">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Role in Buying Decision"
                  htmlFor="buyingRole"
                >
                  <FormSelect
                    id="buyingRole"
                    value={form.buyingRole}
                    onValueChange={(v) => update("buyingRole", v as BuyingRole)}
                    options={BUYING_ROLES.map((role) => ({
                      value: role,
                      label: role,
                    }))}
                  />
                </FormField>
                <FormField label="Primary Contact Flag" htmlFor="isPrimary">
                  <FormSelect
                    id="isPrimary"
                    value={form.isPrimary}
                    onValueChange={(v) =>
                      update("isPrimary", v as "yes" | "no")
                    }
                    options={[...PRIMARY_CONTACT_OPTIONS]}
                  />
                </FormField>
              </div>
              <FormField label="Reports To" htmlFor="reportsTo">
                {reportOptions.length > 0 ? (
                  <FormSelect
                    id="reportsTo"
                    value={form.reportsTo || "__none__"}
                    onValueChange={(v) =>
                      update("reportsTo", v === "__none__" ? "" : v)
                    }
                    placeholder="Select manager (optional)"
                    options={[
                      { value: "__none__", label: "— None —" },
                      ...reportOptions.map((entry) => ({
                        value: entry.name,
                        label: `${entry.name} · ${entry.designation}`,
                      })),
                    ]}
                  />
                ) : (
                  <Input
                    id="reportsTo"
                    value={form.reportsTo}
                    onChange={(e) => update("reportsTo", e.target.value)}
                    placeholder="Name of manager (optional)"
                  />
                )}
              </FormField>
              <FormField
                label="Birthday / Anniversary"
                htmlFor="birthdayOrAnniversary"
              >
                <DatePicker
                  value={form.birthdayOrAnniversary}
                  onChange={(value) => update("birthdayOrAnniversary", value)}
                  placeholder="Optional — for relationship building"
                />
              </FormField>
            </FormSection>

            <Separator />

            <FormSection title="Notes">
              <FormField label="Notes about the person" htmlFor="notes">
                <Textarea
                  id="notes"
                  rows={4}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Preferences, rapport, conversation history..."
                />
              </FormField>
            </FormSection>
          </div>

          <SheetFooter className="shrink-0 border-t px-6 py-4 sm:justify-end">
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={!form.customerId}>
              {isAdd ? "Save Contact" : "Save Changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
