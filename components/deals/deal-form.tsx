"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DeleteRecordButton } from "@/components/shared/delete-record-button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { FormSection, FormSections } from "@/components/shared/form-section";
import { ReadOnlyIdField } from "@/components/shared/record-id";
import { FormSelect } from "@/components/shared/form-select";
import { CustomerSearchSelect } from "@/components/shared/customer-search-select";
import { RecordFormPage } from "@/components/records/record-form-page";
import { DealLineItemsEditor } from "@/components/deals/deal-line-items-editor";
import {
  DealFollowUpsEditor,
  createFollowUpItem,
  type DealFollowUpItem,
} from "@/components/deals/deal-follow-ups-editor";
import { HELP } from "@/lib/help-content";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { canAssignDeals } from "@/lib/role-permissions";
import { CONFIDENCE_FORM_OPTIONS } from "@/lib/confidence-constants";
import {
  calculateDealEstimatedValue,
  createDealLineItem,
  formatDealProductsSummary,
  isValidDealLineItems,
  resolveDealLineItemsToProducts,
  suggestSupplierFromCustomerProduct,
} from "@/lib/deal-form-helpers";
import { getTasksByDealId } from "@/lib/deal-helpers";
import { isTaskOpen } from "@/lib/task-constants";
import { filterCustomersForUser } from "@/lib/user-helpers";
import { formatCurrency } from "@/lib/utils";
import { recordListRoutes } from "@/lib/record-routes";
import { navigateAfterSave } from "@/lib/navigate-after-save";
import type { ConfidenceLevel, Customer, Deal, DealLineItem } from "@/lib/types";

function createDefaultForm(defaultStageId: string, defaultOwner: string) {
  return {
    customerId: "",
    contactId: "",
    confidence: "25" as `${ConfidenceLevel}`,
    stage: defaultStageId,
    owner: defaultOwner,
  };
}

function createDealId(existingDeals: Deal[]): string {
  const year = new Date().getFullYear();
  const maxNum = existingDeals.reduce((max, deal) => {
    const match = deal.id.match(/DEAL-\d+-(\d+)/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `DEAL-${year}-${String(maxNum + 1).padStart(3, "0")}`;
}

function applyCustomerSuggestionsToLineItems(
  lineItems: DealLineItem[],
  customer?: Customer
) {
  if (!customer) return lineItems;
  return lineItems.map((item) => {
    const suggestion = suggestSupplierFromCustomerProduct(customer, item.productId);
    if (!suggestion) return item;
    return {
      ...item,
      currentSupplierId: item.currentSupplierId || suggestion.supplierId,
      currentSupplierPrice: item.currentSupplierPrice || suggestion.price,
    };
  });
}

interface DealFormProps {
  dealId?: string;
}

export function DealForm({ dealId }: DealFormProps) {
  const router = useRouter();
  const { currentUser, users } = useAuth();
  const {
    deals,
    dealTasks,
    customers,
    contacts,
    products,
    suppliers,
    pipelineStages,
    masterData,
    getDealById,
    getCustomerById,
    getContactsByCustomerId,
    getProductById,
    addDeal,
    updateDeal,
    deleteDeal,
    addProduct,
    addDealTask,
    updateDealTask,
    deleteDealTask,
  } = useCrmData();

  const canAssign = canAssignDeals(currentUser.role);
  const deal = dealId ? getDealById(dealId) : undefined;
  const isAdd = !dealId;

  const defaultStageId =
    pipelineStages.find((stage) => stage.id === "lead-hot")?.id ??
    pipelineStages.find((stage) => stage.kind === "open")?.id ??
    pipelineStages[0]?.id ??
    "";

  const visibleCustomers = React.useMemo(
    () => filterCustomersForUser(customers, currentUser, users),
    [customers, currentUser, users]
  );

  const [form, setForm] = React.useState(() =>
    deal
      ? {
          customerId: deal.customerId,
          contactId: deal.contactId,
          confidence: String(deal.confidence) as `${ConfidenceLevel}`,
          stage: deal.stage,
          owner: deal.owner,
        }
      : {
          ...createDefaultForm(defaultStageId, currentUser.name),
          customerId: visibleCustomers[0]?.id ?? "",
        }
  );
  const [lineItems, setLineItems] = React.useState<DealLineItem[]>(
    deal?.lineItems ?? []
  );
  const [followUps, setFollowUps] = React.useState<DealFollowUpItem[]>([]);
  const [removedFollowUpIds, setRemovedFollowUpIds] = React.useState<string[]>(
    []
  );

  React.useEffect(() => {
    if (!deal) return;
    setForm({
      customerId: deal.customerId,
      contactId: deal.contactId,
      confidence: String(deal.confidence) as `${ConfidenceLevel}`,
      stage: deal.stage,
      owner: deal.owner,
    });
    setLineItems(
      deal.lineItems.map((item) => {
        if (item.productCategory) return item;
        const product = getProductById(item.productId);
        return { ...item, productCategory: product?.motorControllerType ?? "" };
      })
    );
    setFollowUps(
      getTasksByDealId(dealTasks, deal.id)
        .filter((task) => isTaskOpen(task.status))
        .map((task) =>
          createFollowUpItem(task.assignedToUserId, {
            clientId: `followup-${task.id}`,
            taskId: task.id,
            title: task.title,
            dueDate: task.dueDate,
            assignedToUserId: task.assignedToUserId,
          })
        )
    );
    setRemovedFollowUpIds([]);
  }, [deal, dealTasks, getProductById]);

  React.useEffect(() => {
    if (!isAdd || form.customerId || !visibleCustomers[0]) return;
    setForm((prev) => ({ ...prev, customerId: visibleCustomers[0].id }));
  }, [isAdd, form.customerId, visibleCustomers]);

  React.useEffect(() => {
    if (!isAdd || lineItems.length > 0 || products.length === 0) return;
    const customer = getCustomerById(form.customerId);
    setLineItems([
      createDealLineItem(products[0], suppliers, customer, { quantity: 0 }),
    ]);
  }, [isAdd, lineItems.length, products, suppliers, form.customerId, getCustomerById]);

  const customerContacts = React.useMemo(
    () => (form.customerId ? getContactsByCustomerId(form.customerId) : []),
    [form.customerId, getContactsByCustomerId]
  );

  React.useEffect(() => {
    const validContact = customerContacts.some((contact) => contact.id === form.contactId);
    if (!validContact) {
      const primary =
        customerContacts.find((contact) => contact.isPrimary) ?? customerContacts[0];
      setForm((prev) => ({ ...prev, contactId: primary?.id ?? "" }));
    }
  }, [customerContacts, form.contactId]);

  const selectedCustomer = getCustomerById(form.customerId);
  const estimatedValue = calculateDealEstimatedValue(lineItems);
  const productsSummary = formatDealProductsSummary(lineItems, getProductById);
  const defaultAssigneeUserId =
    users.find((user) => user.name === form.owner)?.id ?? currentUser.id;

  const categoryOptions = React.useMemo(
    () =>
      masterData.productTypes.map((type) => ({
        value: type,
        label: type,
      })),
    [masterData.productTypes]
  );

  const handleFollowUpsChange = (next: DealFollowUpItem[]) => {
    const removedIds = followUps
      .filter((item) => item.taskId)
      .filter((item) => !next.some((entry) => entry.taskId === item.taskId))
      .map((item) => item.taskId!);
    if (removedIds.length > 0) {
      setRemovedFollowUpIds((prev) => [...prev, ...removedIds]);
    }
    setFollowUps(next);
  };

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = getCustomerById(customerId);
    setForm((prev) => ({ ...prev, customerId, contactId: "" }));
    setLineItems((prev) => applyCustomerSuggestionsToLineItems(prev, customer));
  };

  const canSubmit = form.customerId && form.contactId && isValidDealLineItems(lineItems);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    const resolvedLineItems = resolveDealLineItemsToProducts(
      lineItems,
      products,
      addProduct,
      currentUser.id
    );

    if (isAdd) {
      const today = new Date().toISOString().split("T")[0];
      const nextDeal: Deal = {
        id: createDealId(deals),
        customerId: form.customerId,
        contactId: form.contactId,
        lineItems: resolvedLineItems,
        estimatedAnnualValue: calculateDealEstimatedValue(resolvedLineItems),
        confidence: Number(form.confidence) as ConfidenceLevel,
        stage: form.stage,
        stageEnteredAt: today,
        lastActivityAt: today,
        owner: canAssign ? form.owner : currentUser.name,
      };
      addDeal(nextDeal);
      followUps.forEach((item) => {
        const title = item.title.trim();
        if (!title) return;
        addDealTask({
          dealId: nextDeal.id,
          title,
          dueDate: item.dueDate,
          createdByUserId: currentUser.id,
          assignedToUserId: item.assignedToUserId,
          assignerName: currentUser.name,
        });
      });
      navigateAfterSave(router, recordListRoutes.deal);
      return;
    }

    if (!deal) return;
    updateDeal(deal.id, {
      customerId: form.customerId,
      contactId: form.contactId,
      lineItems: resolvedLineItems,
      estimatedAnnualValue: calculateDealEstimatedValue(resolvedLineItems),
      confidence: Number(form.confidence) as ConfidenceLevel,
      stage: form.stage,
      owner: canAssign ? form.owner : deal.owner,
    });
    removedFollowUpIds.forEach((taskId) => deleteDealTask(taskId));
    followUps.forEach((item) => {
      const title = item.title.trim();
      if (!title) return;
      if (item.taskId) {
        updateDealTask(item.taskId, {
          title,
          dueDate: item.dueDate,
          assignedToUserId: item.assignedToUserId,
          assignerName: currentUser.name,
        });
        return;
      }
      addDealTask({
        dealId: deal.id,
        title,
        dueDate: item.dueDate,
        createdByUserId: currentUser.id,
        assignedToUserId: item.assignedToUserId,
        assignerName: currentUser.name,
      });
    });
    navigateAfterSave(router, recordListRoutes.deal);
  };

  const handleDelete = () => {
    if (!deal) return;
    const removed = deleteDeal(deal.id);
    if (removed) router.push(recordListRoutes.deal);
  };

  return (
    <RecordFormPage
      backHref={recordListRoutes.deal}
      backLabel="Deals"
      title={isAdd ? "Create Deal" : "Edit Deal"}
      description={
        isAdd
          ? "Create a new opportunity with products linked to the pipeline."
          : "Update deal details, products, and follow-ups."
      }
      onSubmit={handleSubmit}
      footer={
        <>
          {!isAdd ? (
            <DeleteRecordButton
              title="Delete deal?"
              description={`This will permanently remove deal ${deal?.id ?? ""}.`}
              onConfirm={handleDelete}
            />
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href={recordListRoutes.deal}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isAdd ? "Create Deal" : "Save Changes"}
            </Button>
          </div>
        </>
      }
    >
      <FormSection title="Summary">
        {!isAdd && deal ? (
          <ReadOnlyIdField label="Deal ID" htmlFor="deal-id" id={deal.id} />
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Customer</p>
            <p className="text-sm font-medium">{selectedCustomer?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Products</p>
            <p className="text-sm font-medium">{productsSummary}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Est. annual value</p>
            <p className="text-sm font-medium text-primary">
              {estimatedValue > 0 ? formatCurrency(estimatedValue) : "—"}
            </p>
          </div>
        </div>
      </FormSection>

      <FormSections>
        <FormSection title="Pipeline">
          <FormField label="Current stage" htmlFor="deal-stage" info={HELP.startingStage}>
            <FormSelect
              id="deal-stage"
              value={form.stage}
              onValueChange={(value) => update("stage", value)}
              options={pipelineStages.map((stage) => ({
                value: stage.id,
                label: stage.name,
              }))}
            />
          </FormField>
          <FormField label="Confidence level" htmlFor="deal-confidence" info={HELP.confidence}>
            <FormSelect
              id="deal-confidence"
              value={form.confidence}
              onValueChange={(value) => update("confidence", value)}
              options={CONFIDENCE_FORM_OPTIONS}
            />
          </FormField>
          <FormField label="Deal owner" htmlFor="deal-owner" info={HELP.dealOwner}>
            {canAssign ? (
              <FormSelect
                id="deal-owner"
                value={form.owner}
                onValueChange={(value) => update("owner", value)}
                options={masterData.accountOwners.map((owner) => ({
                  value: owner,
                  label: owner,
                }))}
              />
            ) : (
              <Input id="deal-owner" readOnly value={currentUser.name} className="bg-muted/30" />
            )}
          </FormField>
        </FormSection>

        <FormSection title="Account">
          <FormField label="Customer name" htmlFor="deal-customer">
            <CustomerSearchSelect
              id="deal-customer"
              customers={visibleCustomers}
              contacts={contacts}
              value={form.customerId}
              onValueChange={handleCustomerChange}
              disabled={visibleCustomers.length === 0}
            />
          </FormField>
          <FormField label="Linked contact person" htmlFor="deal-contact">
            <FormSelect
              id="deal-contact"
              value={form.contactId}
              onValueChange={(value) => update("contactId", value)}
              disabled={customerContacts.length === 0}
              options={customerContacts.map((contact) => ({
                value: contact.id,
                label: `${contact.name}${contact.isPrimary ? " (Primary)" : ""}`,
              }))}
            />
          </FormField>
          <FormField label="OEM segment" htmlFor="deal-oem-segment" optional>
            <Input
              id="deal-oem-segment"
              readOnly
              value={selectedCustomer?.oemSegment ?? ""}
              placeholder="Select a customer"
              className="bg-muted/30"
            />
          </FormField>
        </FormSection>

        <FormSection title="Products">
          <DealLineItemsEditor
            items={lineItems}
            onChange={setLineItems}
            customer={selectedCustomer}
            products={products}
            suppliers={suppliers}
            categoryOptions={categoryOptions}
            getProductById={getProductById}
          />
        </FormSection>

        <FormSection title="Follow-up">
          <DealFollowUpsEditor
            items={followUps}
            onChange={handleFollowUpsChange}
            defaultAssigneeUserId={defaultAssigneeUserId}
          />
        </FormSection>
      </FormSections>
    </RecordFormPage>
  );
}
