import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createDealTaskId,
  createReminderId,
} from "@/lib/deal-record-ids";
import { normalizeStageId } from "@/lib/default-pipeline-stages";
import { filterBootstrapForUser } from "@/lib/server/access-control";
import {
  mapContact,
  mapCustomer,
  mapDeal,
  mapDealActivity,
  mapDealTask,
  mapDocumentExchange,
  mapMasterData,
  mapPipelineStages,
  mapProduct,
  mapReminder,
  mapSupplier,
  mapUser,
} from "@/lib/server/crm-mappers";
import { canUserAccessDeal, canUserAccessTask } from "@/lib/user-helpers";
import type {
  CrmReminder,
  CrmUser,
  Deal,
  DealTask,
  PipelineStage,
  TaskStatus,
} from "@/lib/types";

function toJson<T>(value: T): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue;
}

async function loadAllUsers(): Promise<CrmUser[]> {
  const rows = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return rows.map(mapUser);
}

async function loadSettings() {
  const settings = await prisma.appSettings.findUnique({
    where: { id: "default" },
  });
  if (!settings) {
    throw new Error("App settings not found. Run db:seed.");
  }
  return {
    pipelineStages: mapPipelineStages(settings.pipelineStages),
    masterData: mapMasterData(settings.masterData),
  };
}

export async function getBootstrap(currentUser: CrmUser) {
  const [
    userRows,
    customerRows,
    contactRows,
    productRows,
    supplierRows,
    dealRows,
    taskRows,
    activityRows,
    documentRows,
    reminderRows,
    settings,
  ] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.customer.findMany(),
    prisma.contact.findMany(),
    prisma.product.findMany(),
    prisma.supplier.findMany(),
    prisma.deal.findMany(),
    prisma.dealTask.findMany(),
    prisma.dealActivity.findMany(),
    prisma.documentExchange.findMany(),
    prisma.crmReminder.findMany(),
    loadSettings(),
  ]);

  const allUsers = userRows.map(mapUser);
  const raw = {
    customers: customerRows.map(mapCustomer),
    contacts: contactRows.map(mapContact),
    products: productRows.map(mapProduct),
    suppliers: supplierRows.map(mapSupplier),
    deals: dealRows.map(mapDeal).map((deal) => ({
      ...deal,
      stage: normalizeStageId(deal.stage, settings.pipelineStages),
    })),
    dealTasks: taskRows.map(mapDealTask),
    dealActivities: activityRows.map(mapDealActivity),
    documentExchanges: documentRows.map(mapDocumentExchange),
    reminders: reminderRows.map(mapReminder),
    users: allUsers,
  };

  const filtered = filterBootstrapForUser(raw, currentUser, allUsers);

  return {
    ...filtered,
    pipelineStages: settings.pipelineStages,
    masterData: settings.masterData,
    currentUser,
  };
}

export async function createDeal(deal: Deal, currentUser: CrmUser) {
  const users = await loadAllUsers();
  if (!canUserAccessDeal({ ...deal, owner: deal.owner }, currentUser, users)) {
    throw new Error("Forbidden");
  }
  await prisma.deal.create({ data: { id: deal.id, payload: toJson(deal) } });
  return deal;
}

export async function updateDeal(
  dealId: string,
  updates: Partial<Deal>,
  currentUser: CrmUser
) {
  const row = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!row) throw new Error("Not found");

  const users = await loadAllUsers();
  const existing = mapDeal(row);
  if (!canUserAccessDeal(existing, currentUser, users)) {
    throw new Error("Forbidden");
  }

  const today = new Date().toISOString().split("T")[0];
  const lineItems = updates.lineItems ?? existing.lineItems;
  const stage = updates.stage ?? existing.stage;
  const stageChanged = Boolean(updates.stage && updates.stage !== existing.stage);

  const next: Deal = {
    ...existing,
    ...updates,
    lineItems,
    stage,
    estimatedAnnualValue:
      updates.estimatedAnnualValue ??
      lineItems.reduce((sum, item) => sum + item.quantity * item.quotedPrice, 0),
    stageEnteredAt:
      updates.stage && updates.stage !== existing.stage
        ? today
        : existing.stageEnteredAt,
    lastActivityAt: stageChanged ? today : existing.lastActivityAt,
  };

  await prisma.deal.update({
    where: { id: dealId },
    data: { payload: toJson(next) },
  });
  return next;
}

export async function moveDealToStage(
  dealId: string,
  stage: PipelineStage,
  currentUser: CrmUser
) {
  return updateDeal(dealId, { stage }, currentUser);
}

export async function deleteDeal(dealId: string, currentUser: CrmUser) {
  const row = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!row) return false;

  const users = await loadAllUsers();
  const existing = mapDeal(row);
  if (!canUserAccessDeal(existing, currentUser, users)) {
    throw new Error("Forbidden");
  }

  await prisma.$transaction(async (tx) => {
    const tasks = await tx.dealTask.findMany();
    for (const task of tasks) {
      const payload = mapDealTask(task);
      if (payload.dealId === dealId) {
        await tx.dealTask.delete({ where: { id: task.id } });
      }
    }

    const activities = await tx.dealActivity.findMany();
    for (const activity of activities) {
      const payload = mapDealActivity(activity);
      if (payload.dealId === dealId) {
        await tx.dealActivity.delete({ where: { id: activity.id } });
      }
    }

    const reminders = await tx.crmReminder.findMany();
    for (const reminder of reminders) {
      const payload = mapReminder(reminder);
      if (payload.dealId === dealId) {
        await tx.crmReminder.delete({ where: { id: reminder.id } });
      }
    }

    const documents = await tx.documentExchange.findMany();
    for (const doc of documents) {
      const payload = mapDocumentExchange(doc);
      if (payload.dealId === dealId) {
        await tx.documentExchange.update({
          where: { id: doc.id },
          data: { payload: toJson({ ...payload, dealId: undefined }) },
        });
      }
    }

    await tx.deal.delete({ where: { id: dealId } });
  });

  return true;
}

async function createReminderRecord(
  reminder: Omit<CrmReminder, "id" | "createdAt" | "readAt">
) {
  const existing = await prisma.crmReminder.findMany();
  const mapped = existing.map(mapReminder);
  const id = createReminderId(mapped);
  const record: CrmReminder = {
    ...reminder,
    id,
    createdAt: new Date().toISOString(),
  };
  await prisma.crmReminder.create({ data: { id, payload: toJson(record) } });
  return record;
}

export async function createDealTask(
  input: Omit<DealTask, "createdAt" | "completedAt"> & {
    assignerName?: string;
  },
  currentUser: CrmUser
) {
  const trimmed = input.title.trim();
  if (!trimmed) throw new Error("Title required");

  const users = await loadAllUsers();
  const dealRow = await prisma.deal.findUnique({ where: { id: input.dealId } });
  if (!dealRow) throw new Error("Deal not found");
  const deal = mapDeal(dealRow);
  if (!canUserAccessDeal(deal, currentUser, users)) {
    throw new Error("Forbidden");
  }

  const existing = (await prisma.dealTask.findMany()).map(mapDealTask);
  const status = input.status ?? "pending";
  const task: DealTask = {
    ...input,
    id: input.id || createDealTaskId(existing),
    title: trimmed,
    status,
    completedAt:
      status === "completed"
        ? new Date().toISOString().split("T")[0]
        : undefined,
    createdAt: new Date().toISOString(),
  };

  await prisma.dealTask.create({ data: { id: task.id, payload: toJson(task) } });

  if (task.assignedToUserId !== task.createdByUserId) {
    await createReminderRecord({
      userId: task.assignedToUserId,
      kind: "task_assigned",
      title: trimmed,
      message: `${input.assignerName ?? "Someone"} assigned you a task`,
      dueDate: task.dueDate,
      dealId: task.dealId,
      taskId: task.id,
    });
  }

  return task;
}

export async function updateDealTask(
  taskId: string,
  updates: Partial<DealTask> & { assignerName?: string },
  currentUser: CrmUser
) {
  const row = await prisma.dealTask.findUnique({ where: { id: taskId } });
  if (!row) throw new Error("Not found");

  const users = await loadAllUsers();
  const deals = (await prisma.deal.findMany()).map(mapDeal);
  const existing = mapDealTask(row);
  if (!canUserAccessTask(existing, currentUser, users, deals)) {
    throw new Error("Forbidden");
  }

  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toISOString();
  const assignedToUserId =
    updates.assignedToUserId ?? existing.assignedToUserId;
  const createdByUserId = updates.createdByUserId ?? existing.createdByUserId;
  const status = updates.status ?? existing.status;
  const reassigned =
    Boolean(updates.assignedToUserId) &&
    updates.assignedToUserId !== existing.assignedToUserId;

  const next: DealTask = {
    ...existing,
    ...updates,
    title: updates.title?.trim() || existing.title,
    status,
    completedAt:
      status === "completed"
        ? updates.completedAt ?? existing.completedAt ?? today
        : updates.status !== undefined
          ? undefined
          : existing.completedAt,
  };

  await prisma.dealTask.update({
    where: { id: taskId },
    data: { payload: toJson(next) },
  });

  if (status === "completed" && updates.status !== undefined) {
    const reminders = await prisma.crmReminder.findMany();
    for (const reminder of reminders) {
      const payload = mapReminder(reminder);
      if (payload.taskId === taskId && !payload.readAt) {
        await prisma.crmReminder.update({
          where: { id: reminder.id },
          data: {
            payload: toJson({ ...payload, readAt: now }),
          },
        });
      }
    }
  }

  if (reassigned && assignedToUserId !== createdByUserId) {
    await createReminderRecord({
      userId: assignedToUserId,
      kind: "task_assigned",
      title: next.title,
      message: `${updates.assignerName ?? "Someone"} assigned you a task`,
      dueDate: next.dueDate,
      dealId: next.dealId,
      taskId,
    });
  }

  return next;
}

export async function updateDealTaskStatus(
  taskId: string,
  status: TaskStatus,
  currentUser: CrmUser
) {
  return updateDealTask(taskId, { status }, currentUser);
}

export async function deleteDealTask(taskId: string, currentUser: CrmUser) {
  const row = await prisma.dealTask.findUnique({ where: { id: taskId } });
  if (!row) return false;

  const users = await loadAllUsers();
  const deals = (await prisma.deal.findMany()).map(mapDeal);
  const existing = mapDealTask(row);
  if (!canUserAccessTask(existing, currentUser, users, deals)) {
    throw new Error("Forbidden");
  }

  await prisma.dealTask.delete({ where: { id: taskId } });

  const reminders = await prisma.crmReminder.findMany();
  for (const reminder of reminders) {
    const payload = mapReminder(reminder);
    if (payload.taskId === taskId) {
      await prisma.crmReminder.delete({ where: { id: reminder.id } });
    }
  }

  return true;
}

export async function patchEntity<T extends { id: string }>(
  model:
    | "customer"
    | "contact"
    | "product"
    | "supplier"
    | "dealActivity"
    | "documentExchange",
  id: string,
  updates: Partial<T>,
  mapFn: (row: { id: string; payload: unknown }) => T
) {
  let row: { id: string; payload: unknown } | null = null;

  switch (model) {
    case "customer":
      row = await prisma.customer.findUnique({ where: { id } });
      break;
    case "contact":
      row = await prisma.contact.findUnique({ where: { id } });
      break;
    case "product":
      row = await prisma.product.findUnique({ where: { id } });
      break;
    case "supplier":
      row = await prisma.supplier.findUnique({ where: { id } });
      break;
    case "dealActivity":
      row = await prisma.dealActivity.findUnique({ where: { id } });
      break;
    case "documentExchange":
      row = await prisma.documentExchange.findUnique({ where: { id } });
      break;
  }

  if (!row) throw new Error("Not found");
  const existing = mapFn(row);
  const next = { ...existing, ...updates, id } as T;

  switch (model) {
    case "customer":
      await prisma.customer.update({
        where: { id },
        data: { payload: toJson(next) },
      });
      break;
    case "contact":
      await prisma.contact.update({
        where: { id },
        data: { payload: toJson(next) },
      });
      break;
    case "product":
      await prisma.product.update({
        where: { id },
        data: { payload: toJson(next) },
      });
      break;
    case "supplier":
      await prisma.supplier.update({
        where: { id },
        data: { payload: toJson(next) },
      });
      break;
    case "dealActivity":
      await prisma.dealActivity.update({
        where: { id },
        data: { payload: toJson(next) },
      });
      break;
    case "documentExchange":
      await prisma.documentExchange.update({
        where: { id },
        data: { payload: toJson(next) },
      });
      break;
  }

  return next;
}

export async function upsertEntityPayload<T extends { id: string }>(
  model:
    | "customer"
    | "contact"
    | "product"
    | "supplier"
    | "dealActivity"
    | "documentExchange",
  record: T
) {
  const data = { id: record.id, payload: toJson(record) };
  switch (model) {
    case "customer":
      await prisma.customer.upsert({
        where: { id: record.id },
        create: data,
        update: { payload: toJson(record) },
      });
      break;
    case "contact":
      await prisma.contact.upsert({
        where: { id: record.id },
        create: data,
        update: { payload: toJson(record) },
      });
      break;
    case "product":
      await prisma.product.upsert({
        where: { id: record.id },
        create: data,
        update: { payload: toJson(record) },
      });
      break;
    case "supplier":
      await prisma.supplier.upsert({
        where: { id: record.id },
        create: data,
        update: { payload: toJson(record) },
      });
      break;
    case "dealActivity":
      await prisma.dealActivity.upsert({
        where: { id: record.id },
        create: data,
        update: { payload: toJson(record) },
      });
      break;
    case "documentExchange":
      await prisma.documentExchange.upsert({
        where: { id: record.id },
        create: data,
        update: { payload: toJson(record) },
      });
      break;
  }
  return record;
}

export async function deleteEntity(
  model:
    | "customer"
    | "contact"
    | "product"
    | "supplier"
    | "dealActivity"
    | "documentExchange",
  id: string
) {
  switch (model) {
    case "customer":
      await prisma.customer.delete({ where: { id } });
      break;
    case "contact":
      await prisma.contact.delete({ where: { id } });
      break;
    case "product":
      await prisma.product.delete({ where: { id } });
      break;
    case "supplier":
      await prisma.supplier.delete({ where: { id } });
      break;
    case "dealActivity":
      await prisma.dealActivity.delete({ where: { id } });
      break;
    case "documentExchange":
      await prisma.documentExchange.delete({ where: { id } });
      break;
  }
}

export async function updateAppSettings(
  updates: {
    pipelineStages?: unknown;
    masterData?: unknown;
  }
) {
  const current = await prisma.appSettings.findUnique({
    where: { id: "default" },
  });
  if (!current) throw new Error("Settings not found");

  await prisma.appSettings.update({
    where: { id: "default" },
    data: {
      pipelineStages: toJson(updates.pipelineStages ?? current.pipelineStages),
      masterData: toJson(updates.masterData ?? current.masterData),
    },
  });
}

export async function updateCrmUser(
  userId: string,
  updates: Partial<CrmUser>
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: updates.name?.trim() ?? user.name,
      email: updates.email?.trim().toLowerCase() ?? user.email,
      role: updates.role ?? user.role,
      active: updates.active ?? user.active,
      reportsToUserId:
        updates.reportsToUserId !== undefined
          ? updates.reportsToUserId
          : user.reportsToUserId,
    },
  });
  return mapUser(updated);
}

export async function createCrmUser(user: Omit<CrmUser, "id">) {
  const created = await prisma.user.create({
    data: {
      id: `user-${Date.now()}`,
      email: user.email.trim().toLowerCase(),
      name: user.name.trim(),
      role: user.role,
      active: user.active,
      reportsToUserId: user.reportsToUserId ?? null,
    },
  });
  return mapUser(created);
}

export async function deleteCrmUser(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
}

export async function markReminderRead(reminderId: string, userId: string) {
  const row = await prisma.crmReminder.findUnique({ where: { id: reminderId } });
  if (!row) return null;
  const existing = mapReminder(row);
  if (existing.userId !== userId) throw new Error("Forbidden");
  const next = { ...existing, readAt: new Date().toISOString() };
  await prisma.crmReminder.update({
    where: { id: reminderId },
    data: { payload: toJson(next) },
  });
  return next;
}

export async function markAllRemindersRead(userId: string) {
  const rows = await prisma.crmReminder.findMany();
  const now = new Date().toISOString();
  for (const row of rows) {
    const reminder = mapReminder(row);
    if (reminder.userId === userId && !reminder.readAt) {
      await prisma.crmReminder.update({
        where: { id: row.id },
        data: { payload: toJson({ ...reminder, readAt: now }) },
      });
    }
  }
}
