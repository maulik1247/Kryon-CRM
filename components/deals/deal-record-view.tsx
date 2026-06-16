"use client";

import { DealForm } from "@/components/deals/deal-form";
import { RecordNotFound } from "@/components/records/record-not-found";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { canUserAccessDeal } from "@/lib/user-helpers";
import { recordListRoutes } from "@/lib/record-routes";

export function DealRecordView({ dealId }: { dealId: string }) {
  const { currentUser, users } = useAuth();
  const { getDealById } = useCrmData();
  const deal = getDealById(dealId);

  if (!deal || !canUserAccessDeal(deal, currentUser, users)) {
    return (
      <RecordNotFound backHref={recordListRoutes.deal} backLabel="deals" />
    );
  }

  return <DealForm dealId={dealId} />;
}
