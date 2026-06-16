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
import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "@/components/shared/form-field";
import { FormSelect } from "@/components/shared/form-select";
import { FormSection } from "@/components/shared/form-section";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-provider";
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

function formToContact(
  form: ContactFormState,
  id: string,
  existing?: Contact,
  createdByUserId?: string
): Contact {
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
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    createdByUserId:
      existing?.createdByUserId ?? createdByUserId ?? "user-admin",
  };
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
  const { currentUser } = useAuth();
  const {
    customers,
    addContact,
    updateContact,
    deleteContact,
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
      addContact(
        formToContact(form, `cont-${Date.now()}`, undefined, currentUser.id)
      );
    } else if (contact) {
      updateContact(contact.id, formToContact(form, contact.id, contact));
    }

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!contact) return;
    const removed = deleteContact(contact.id);
    if (removed) onOpenChange(false);
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
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="relationship">Relationship</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-4 space-y-4">
            <FormSection>
              <FormField label="Contact Name" htmlFor="contact-name">
                <Input
                  id="contact-name"
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </FormField>
              <FormField label="Designation / title" htmlFor="designation">
                <Input
                  id="designation"
                  required
                  value={form.designation}
                  onChange={(e) => update("designation", e.target.value)}
                />
              </FormField>
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
            </FormSection>
              </TabsContent>

              <TabsContent value="contact" className="mt-4 space-y-4">
            <FormSection>
              <FormField label="Phone (mobile)" htmlFor="phone">
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
              <FormField
                label="Phone (office)"
                htmlFor="officePhone"
                optional
              >
                <Input
                  id="officePhone"
                  value={form.officePhone}
                  onChange={(e) => update("officePhone", e.target.value)}
                />
              </FormField>
              <FormField label="LinkedIn URL" htmlFor="linkedInUrl" optional>
                <Input
                  id="linkedInUrl"
                  type="url"
                  value={form.linkedInUrl}
                  onChange={(e) => update("linkedInUrl", e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </FormField>
            </FormSection>
              </TabsContent>

              <TabsContent value="relationship" className="mt-4 space-y-4">
            <FormSection>
              <FormField label="Role in buying decision" htmlFor="buyingRole">
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
              <FormField label="Primary contact" htmlFor="isPrimary">
                <FormSelect
                  id="isPrimary"
                  value={form.isPrimary}
                  onValueChange={(v) =>
                    update("isPrimary", v as "yes" | "no")
                  }
                  options={[...PRIMARY_CONTACT_OPTIONS]}
                />
              </FormField>
              <FormField label="Reports to" htmlFor="reportsTo" optional>
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
                label="Birthday / anniversary"
                htmlFor="birthdayOrAnniversary"
                optional
              >
                <DatePicker
                  value={form.birthdayOrAnniversary}
                  onChange={(value) => update("birthdayOrAnniversary", value)}
                  placeholder="Optional"
                />
              </FormField>
              <FormField label="Notes" htmlFor="notes" optional>
                <Textarea
                  id="notes"
                  rows={4}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Preferences, rapport, conversation history..."
                />
              </FormField>
            </FormSection>
              </TabsContent>
            </Tabs>
          </div>

          <SheetFooter className="shrink-0 border-t px-6 py-4 sm:justify-between">
            {!isAdd ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
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
                {isAdd ? "Save Contact" : "Save Changes"}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
