import { DetailGrid } from "@/components/shared/detail-grid";
import { getConfidenceLabel } from "@/lib/confidence-constants";
import {
  formatDealProductsSummary,
  getDealLineItemLabel,
} from "@/lib/deal-form-helpers";
import type { Deal } from "@/lib/types";
import { formatCurrency, daysSince, formatDate } from "@/lib/utils";

interface DealExpandedDetailsProps {
  deal: Deal;
  customerName?: string;
  contactName?: string;
  stageName: string;
  getProductById: (productId: string) => import("@/lib/types").Product | undefined;
}

export function DealExpandedDetails({
  deal,
  customerName,
  contactName,
  stageName,
  getProductById,
}: DealExpandedDetailsProps) {
  const productsSummary = formatDealProductsSummary(
    deal.lineItems,
    getProductById
  );

  return (
    <div className="space-y-6">
      <DetailGrid
        items={[
          { label: "Customer", value: customerName },
          { label: "Contact", value: contactName },
          { label: "Stage", value: stageName, emphasis: true },
          {
            label: "Confidence",
            value: getConfidenceLabel(deal.confidence),
          },
          { label: "Owner", value: deal.owner },
          {
            label: "Est. annual value",
            value: formatCurrency(deal.estimatedAnnualValue),
            emphasis: true,
          },
          { label: "Products", value: productsSummary, className: "col-span-2" },
          {
            label: "Days in stage",
            value: `${daysSince(deal.stageEnteredAt)} days`,
          },
          {
            label: "Last activity",
            value: formatDate(deal.lastActivityAt),
          },
          {
            label: "Stage entered",
            value: formatDate(deal.stageEnteredAt),
          },
        ]}
      />

      {deal.lineItems.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">Line items</p>
          <ul className="space-y-2">
            {deal.lineItems.map((item, index) => (
              <li
                key={item.id}
                className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm"
              >
                <p className="font-medium">
                  {index + 1}. {getDealLineItemLabel(item, getProductById)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.productCategory} · {item.quantity.toLocaleString("en-IN")}{" "}
                  pcs · Quote ₹{item.quotedPrice.toLocaleString("en-IN")}/unit
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
