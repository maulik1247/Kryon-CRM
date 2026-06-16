"use client";

import { ContactForm } from "@/components/contacts/contact-form";
import { RecordNotFound } from "@/components/records/record-not-found";
import { useCrmData } from "@/lib/crm-data-provider";
import { recordListRoutes } from "@/lib/record-routes";

export function ContactRecordView({ contactId }: { contactId: string }) {
  const { getContactById } = useCrmData();
  const contact = getContactById(contactId);

  if (!contact) {
    return (
      <RecordNotFound
        backHref={recordListRoutes.contact}
        backLabel="contacts"
      />
    );
  }

  return <ContactForm contactId={contactId} />;
}
