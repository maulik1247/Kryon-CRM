"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogActivityForm } from "@/components/deals/log-activity-form";
import { useCrmData } from "@/lib/crm-data-provider";

interface LogActivityDialogProps {
  defaultDealId?: string;
}

export function LogActivityDialog({ defaultDealId }: LogActivityDialogProps) {
  const { deals, getCustomerById } = useCrmData();
  const [open, setOpen] = React.useState(false);
  const [dealId, setDealId] = React.useState(defaultDealId ?? deals[0]?.id ?? "");

  const selectedDeal = deals.find((deal) => deal.id === dealId);
  const customer = selectedDeal
    ? getCustomerById(selectedDeal.customerId)
    : undefined;

  React.useEffect(() => {
    if (defaultDealId) {
      setDealId(defaultDealId);
    }
  }, [defaultDealId]);

  React.useEffect(() => {
    if (!dealId && deals[0]) {
      setDealId(deals[0].id);
    }
  }, [dealId, deals]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Log Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Log activity</DialogTitle>
          <DialogDescription>
            Record a call, meeting, or conversation on a deal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="log-activity-deal">Deal</Label>
            <Select value={dealId} onValueChange={setDealId}>
              <SelectTrigger id="log-activity-deal">
                <SelectValue placeholder="Select a deal" />
              </SelectTrigger>
              <SelectContent>
                {deals.map((deal) => {
                  const dealCustomer = getCustomerById(deal.customerId);
                  return (
                    <SelectItem key={deal.id} value={deal.id}>
                      {dealCustomer?.name ?? "Unknown"} · {deal.id}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedDeal && customer ? (
            <LogActivityForm
              dealId={selectedDeal.id}
              customerId={selectedDeal.customerId}
              onLogged={() => setOpen(false)}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Add a deal before logging activity.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
