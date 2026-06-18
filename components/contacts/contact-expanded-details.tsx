import { RoleBadge } from "@/components/shared/role-badge";
import { DetailGrid } from "@/components/shared/detail-grid";
import type { Contact } from "@/lib/types";

interface ContactExpandedDetailsProps {
  contact: Contact;
  customerName?: string;
}

export function ContactExpandedDetails({
  contact,
  customerName,
}: ContactExpandedDetailsProps) {
  return (
    <DetailGrid
      items={[
        { label: "ID", value: contact.id, mono: true },
        { label: "Customer", value: customerName },
        { label: "Department", value: contact.department },
        { label: "Mobile", value: contact.phone },
        { label: "Email", value: contact.email },
        { label: "Office / Landline", value: contact.officePhone },
        {
          label: "Buying role",
          children: <RoleBadge role={contact.buyingRole} />,
        },
        { label: "Reports to", value: contact.reportsTo },
        {
          label: "Primary contact",
          value: contact.isPrimary ? "Yes" : "No",
        },
        { label: "LinkedIn", value: contact.linkedInUrl, className: "col-span-2" },
        {
          label: "Birthday / Anniversary",
          value: contact.birthdayOrAnniversary,
        },
        { label: "Notes", value: contact.notes, className: "col-span-2" },
      ]}
    />
  );
}
