"use client";

import * as React from "react";
import {
  customers as initialCustomers,
  contacts as initialContacts,
  products as initialProducts,
  deals as initialDeals,
  dealTasks as initialDealTasks,
  dealActivities as initialDealActivities,
  reminders as initialReminders,
} from "@/lib/mock-data";
import {
  createDealActivityId,
  createDealTaskId,
  createReminderId,
} from "@/lib/deal-record-ids";
import { createDefaultAttendance } from "@/lib/default-attendance";
import { getTodayDateString } from "@/lib/attendance-helpers";
import { getTaskStatusLabel } from "@/lib/task-constants";
import { isAssignableActivityType } from "@/lib/user-helpers";
import {
  DEFAULT_PIPELINE_STAGES,
  normalizeStageId,
  slugifyStageId,
} from "@/lib/default-pipeline-stages";
import { DEFAULT_MASTER_DATA } from "@/lib/default-master-data";
import {
  notifyCreated,
  notifyDeleted,
  notifyError,
  notifyInfo,
  notifyUpdated,
} from "@/lib/crm-notifications";
import type {
  Customer,
  Contact,
  Product,
  Deal,
  DealActivity,
  DealTask,
  AttendanceRecord,
  TaskStatus,
  CrmReminder,
  CrmReminderKind,
  MasterDataListKey,
  MasterDataLists,
  PipelineStage,
  PipelineStageConfig,
} from "@/lib/types";

interface CrmDataContextValue {
  customers: Customer[];
  contacts: Contact[];
  products: Product[];
  deals: Deal[];
  dealTasks: DealTask[];
  dealActivities: DealActivity[];
  reminders: CrmReminder[];
  attendanceRecords: AttendanceRecord[];
  pipelineStages: PipelineStageConfig[];
  masterData: MasterDataLists;
  addMasterDataItem: (list: MasterDataListKey, value: string) => boolean;
  removeMasterDataItem: (list: MasterDataListKey, value: string) => boolean;
  renameMasterDataItem: (
    list: MasterDataListKey,
    oldValue: string,
    newValue: string
  ) => boolean;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void;
  importCustomers: (customers: Customer[]) => void;
  deleteCustomer: (customerId: string) => boolean;
  addContact: (contact: Contact) => void;
  updateContact: (contactId: string, updates: Partial<Contact>) => void;
  deleteContact: (contactId: string) => boolean;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => boolean;
  addDeal: (deal: Deal) => void;
  updateDeal: (dealId: string, updates: Partial<Deal>) => void;
  moveDealToStage: (dealId: string, stage: PipelineStage) => void;
  addDealTask: (
    task: Omit<
      DealTask,
      "id" | "createdAt" | "completedAt" | "status"
    > & {
      status?: TaskStatus;
      assignerName?: string;
    }
  ) => void;
  updateDealTask: (
    taskId: string,
    updates: Partial<DealTask> & { assignerName?: string }
  ) => void;
  updateDealTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteDealTask: (taskId: string) => void;
  addDealActivity: (
    activity: Omit<DealActivity, "id" | "createdAt"> & {
      recorderName?: string;
    }
  ) => void;
  updateDealActivity: (
    activityId: string,
    updates: Partial<DealActivity> & { recorderName?: string }
  ) => void;
  deleteDealActivity: (activityId: string) => void;
  markReminderRead: (reminderId: string) => void;
  markAllRemindersRead: (userId: string) => void;
  checkIn: (userId: string) => void;
  checkOut: (userId: string) => void;
  addPipelineStage: (name: string, color: string) => void;
  updatePipelineStage: (
    stageId: string,
    updates: Partial<Pick<PipelineStageConfig, "name" | "color">>
  ) => void;
  removePipelineStage: (stageId: string) => boolean;
  getCustomerById: (id: string) => Customer | undefined;
  getContactById: (id: string) => Contact | undefined;
  getProductById: (id: string) => Product | undefined;
  getDealById: (id: string) => Deal | undefined;
  getStageById: (id: string) => PipelineStageConfig | undefined;
  getContactsByCustomerId: (customerId: string) => Contact[];
  getDealsByCustomerId: (customerId: string) => Deal[];
}

const CrmDataContext = React.createContext<CrmDataContextValue | null>(null);

function normalizeDeals(
  deals: Deal[],
  stages: PipelineStageConfig[]
): Deal[] {
  return deals.map((deal) => ({
    ...deal,
    stage: normalizeStageId(deal.stage, stages),
  }));
}

export function CrmDataProvider({ children }: { children: React.ReactNode }) {
  const [pipelineStages, setPipelineStages] = React.useState(
    DEFAULT_PIPELINE_STAGES
  );
  const [masterData, setMasterData] =
    React.useState<MasterDataLists>(DEFAULT_MASTER_DATA);
  const [customers, setCustomers] = React.useState(initialCustomers);
  const [contacts, setContacts] = React.useState(initialContacts);
  const [products, setProducts] = React.useState(initialProducts);
  const [deals, setDeals] = React.useState(() =>
    normalizeDeals(initialDeals, DEFAULT_PIPELINE_STAGES)
  );
  const [dealTasks, setDealTasks] = React.useState(initialDealTasks);
  const [dealActivities, setDealActivities] =
    React.useState(initialDealActivities);
  const [reminders, setReminders] = React.useState(initialReminders);
  const [attendanceRecords, setAttendanceRecords] = React.useState(
    createDefaultAttendance
  );

  const pushReminder = React.useCallback(
    (reminder: Omit<CrmReminder, "id" | "createdAt" | "readAt">) => {
      setReminders((prev) => [
        ...prev,
        {
          ...reminder,
          id: createReminderId(prev),
          createdAt: new Date().toISOString(),
        },
      ]);
    },
    []
  );

  const touchDealLastActivity = React.useCallback(
    (dealId: string, activityDate: string) => {
      setDeals((prev) =>
        prev.map((deal) =>
          deal.id === dealId ? { ...deal, lastActivityAt: activityDate } : deal
        )
      );
    },
    []
  );

  const addMasterDataItem = React.useCallback(
    (list: MasterDataListKey, value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return false;

      let added = false;
      setMasterData((prev) => {
        const exists = prev[list].some(
          (item) => item.toLowerCase() === trimmed.toLowerCase()
        );
        if (exists) return prev;
        added = true;
        return { ...prev, [list]: [...prev[list], trimmed] };
      });
      return added;
    },
    []
  );

  const removeMasterDataItem = React.useCallback(
    (list: MasterDataListKey, value: string) => {
      let removed = false;
      setMasterData((prev) => {
        if (prev[list].length <= 1) return prev;
        const next = prev[list].filter((item) => item !== value);
        if (next.length === prev[list].length) return prev;
        removed = true;
        return { ...prev, [list]: next };
      });
      return removed;
    },
    []
  );

  const renameMasterDataItem = React.useCallback(
    (list: MasterDataListKey, oldValue: string, newValue: string) => {
      const trimmed = newValue.trim();
      if (!trimmed || trimmed === oldValue) return false;

      let renamed = false;
      setMasterData((prev) => {
        const duplicate = prev[list].some(
          (item) =>
            item.toLowerCase() === trimmed.toLowerCase() && item !== oldValue
        );
        if (duplicate) return prev;

        renamed = true;
        return {
          ...prev,
          [list]: prev[list].map((item) =>
            item === oldValue ? trimmed : item
          ),
        };
      });
      return renamed;
    },
    []
  );

  const addCustomer = React.useCallback((customer: Customer) => {
    setCustomers((prev) => [...prev, customer]);
    notifyCreated("Customer", customer.name);
  }, []);

  const updateCustomer = React.useCallback(
    (customerId: string, updates: Partial<Customer>) => {
      let customerName: string | undefined;

      setCustomers((prev) => {
        const existing = prev.find((customer) => customer.id === customerId);
        if (!existing) return prev;

        customerName = updates.name ?? existing.name;
        return prev.map((customer) =>
          customer.id === customerId ? { ...customer, ...updates } : customer
        );
      });

      if (customerName) {
        notifyUpdated("Customer", customerName);
      }
    },
    []
  );

  const importCustomers = React.useCallback((imported: Customer[]) => {
    setCustomers((prev) => {
      const byName = new Map(
        prev.map((customer) => [customer.name.trim().toLowerCase(), customer])
      );
      const byGstin = new Map(
        prev
          .filter((customer) => customer.gstin)
          .map((customer) => [customer.gstin.toUpperCase(), customer])
      );

      for (const row of imported) {
        const nameKey = row.name.trim().toLowerCase();
        const gstinKey = row.gstin.trim().toUpperCase();
        const existing =
          (gstinKey && byGstin.get(gstinKey)) || byName.get(nameKey);

        if (existing) {
          const merged = { ...existing, ...row, id: existing.id };
          byName.set(nameKey, merged);
          if (merged.gstin) {
            byGstin.set(merged.gstin.toUpperCase(), merged);
          }
        } else {
          byName.set(nameKey, row);
          if (row.gstin) {
            byGstin.set(row.gstin.toUpperCase(), row);
          }
        }
      }

      return Array.from(byName.values());
    });
  }, []);

  const deleteCustomer = React.useCallback(
    (customerId: string) => {
      const customer = customers.find((entry) => entry.id === customerId);
      const hasContacts = contacts.some((c) => c.customerId === customerId);
      const hasDeals = deals.some((d) => d.customerId === customerId);
      if (hasContacts || hasDeals) {
        notifyError(
          "Cannot delete customer",
          "Remove linked contacts and deals first."
        );
        return false;
      }

      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
      notifyDeleted("Customer", customer?.name);
      return true;
    },
    [contacts, deals, customers]
  );

  const addContact = React.useCallback((contact: Contact) => {
    setContacts((prev) => {
      if (contact.isPrimary) {
        return [
          ...prev.map((c) =>
            c.customerId === contact.customerId ? { ...c, isPrimary: false } : c
          ),
          contact,
        ];
      }
      return [...prev, contact];
    });
    notifyCreated("Contact", contact.name);
  }, []);

  const updateContact = React.useCallback(
    (contactId: string, updates: Partial<Contact>) => {
      let contactName: string | undefined;

      setContacts((prev) => {
        const existing = prev.find((contact) => contact.id === contactId);
        if (!existing) return prev;

        const updated = { ...existing, ...updates };
        contactName = updates.name ?? existing.name;

        if (updated.isPrimary) {
          return prev.map((contact) => {
            if (contact.id === contactId) return updated;
            if (contact.customerId === updated.customerId) {
              return { ...contact, isPrimary: false };
            }
            return contact;
          });
        }

        return prev.map((contact) =>
          contact.id === contactId ? updated : contact
        );
      });

      if (contactName) {
        notifyUpdated("Contact", contactName);
      }
    },
    []
  );

  const deleteContact = React.useCallback(
    (contactId: string) => {
      const contact = contacts.find((entry) => entry.id === contactId);
      const usedInDeal = deals.some((d) => d.contactId === contactId);
      if (usedInDeal) {
        notifyError(
          "Cannot delete contact",
          "Reassign linked deals before deleting."
        );
        return false;
      }

      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      notifyDeleted("Contact", contact?.name);
      return true;
    },
    [deals, contacts]
  );

  const addProduct = React.useCallback((product: Product) => {
    setProducts((prev) => [...prev, product]);
    notifyCreated("Product", product.model);
  }, []);

  const updateProduct = React.useCallback(
    (productId: string, updates: Partial<Product>) => {
      let productName: string | undefined;

      setProducts((prev) => {
        const existing = prev.find((product) => product.id === productId);
        if (!existing) return prev;

        productName = updates.model ?? existing.model;
        return prev.map((product) =>
          product.id === productId ? { ...product, ...updates } : product
        );
      });

      if (productName) {
        notifyUpdated("Product", productName);
      }
    },
    []
  );

  const deleteProduct = React.useCallback(
    (productId: string) => {
      const product = products.find((entry) => entry.id === productId);
      const usedInDeal = deals.some((d) => d.productId === productId);
      if (usedInDeal) {
        notifyError(
          "Cannot delete product",
          "Reassign linked deals before deleting."
        );
        return false;
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      notifyDeleted("Product", product?.model);
      return true;
    },
    [deals, products]
  );

  const addDeal = React.useCallback((deal: Deal) => {
    setDeals((prev) => [...prev, deal]);
    notifyCreated("Deal", deal.id);
  }, []);

  const updateDeal = React.useCallback(
    (dealId: string, updates: Partial<Deal>) => {
      const today = new Date().toISOString().split("T")[0];
      let stageChanged = false;

      setDeals((prev) =>
        prev.map((deal) => {
          if (deal.id !== dealId) return deal;

          const quantity = updates.quantity ?? deal.quantity;
          const quotedPrice = updates.quotedPrice ?? deal.quotedPrice;
          const stage = updates.stage ?? deal.stage;
          stageChanged = Boolean(updates.stage && updates.stage !== deal.stage);

          return {
            ...deal,
            ...updates,
            quantity,
            quotedPrice,
            stage,
            estimatedAnnualValue: quantity * quotedPrice,
            stageEnteredAt:
              updates.stage && updates.stage !== deal.stage
                ? today
                : deal.stageEnteredAt,
            lastActivityAt: stageChanged ? today : deal.lastActivityAt,
          };
        })
      );
      notifyUpdated("Deal", dealId);
    },
    []
  );

  const moveDealToStage = React.useCallback(
    (dealId: string, stage: PipelineStage) => {
      const today = new Date().toISOString().split("T")[0];
      setDeals((prev) =>
        prev.map((deal) =>
          deal.id === dealId
            ? {
                ...deal,
                stage,
                stageEnteredAt: today,
                lastActivityAt: today,
              }
            : deal
        )
      );
      notifyUpdated("Deal stage", dealId);
    },
    []
  );

  const addDealTask = React.useCallback(
    (
      task: Omit<
        DealTask,
        "id" | "createdAt" | "completedAt" | "status"
      > & {
        status?: TaskStatus;
        assignerName?: string;
      }
    ) => {
      const trimmed = task.title.trim();
      if (!trimmed) return;

      const status = task.status ?? "pending";
      let taskId = "";

      setDealTasks((prev) => {
        taskId = createDealTaskId(prev);
        return [
          ...prev,
          {
            ...task,
            id: taskId,
            title: trimmed,
            status,
            completedAt:
              status === "completed"
                ? new Date().toISOString().split("T")[0]
                : undefined,
            createdAt: new Date().toISOString(),
          },
        ];
      });

      if (task.assignedToUserId !== task.createdByUserId && taskId) {
        pushReminder({
          userId: task.assignedToUserId,
          kind: "task_assigned",
          title: trimmed,
          message: `${task.assignerName ?? "Someone"} assigned you a task`,
          dueDate: task.dueDate,
          dealId: task.dealId,
          taskId,
        });
        notifyInfo(
          "Task assigned",
          "The assignee will see a reminder in their notifications."
        );
      }

      notifyCreated("Task", trimmed);
    },
    [pushReminder]
  );

  const updateDealTask = React.useCallback(
    (
      taskId: string,
      updates: Partial<DealTask> & { assignerName?: string }
    ) => {
      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toISOString();
      let taskTitle: string | undefined;
      let reassigned = false;
      let statusChanged = false;
      let completedStatus = false;
      let reminderPayload: Omit<
        CrmReminder,
        "id" | "createdAt" | "readAt"
      > | null = null;

      setDealTasks((prev) => {
        const existing = prev.find((task) => task.id === taskId);
        if (!existing) return prev;

        const assignedToUserId =
          updates.assignedToUserId ?? existing.assignedToUserId;
        const createdByUserId =
          updates.createdByUserId ?? existing.createdByUserId;
        const status = updates.status ?? existing.status;

        reassigned =
          Boolean(updates.assignedToUserId) &&
          updates.assignedToUserId !== existing.assignedToUserId;
        statusChanged =
          updates.status !== undefined && updates.status !== existing.status;
        completedStatus = status === "completed";

        taskTitle = updates.title?.trim() || existing.title;

        if (
          reassigned &&
          assignedToUserId !== createdByUserId
        ) {
          reminderPayload = {
            userId: assignedToUserId,
            kind: "task_assigned",
            title: taskTitle,
            message: `${updates.assignerName ?? "Someone"} assigned you a task`,
            dueDate: updates.dueDate ?? existing.dueDate,
            dealId: updates.dealId ?? existing.dealId,
            taskId,
          };
        }

        return prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                ...updates,
                title: updates.title?.trim() || task.title,
                status,
                completedAt:
                  status === "completed"
                    ? updates.completedAt ?? task.completedAt ?? today
                    : updates.status !== undefined
                      ? undefined
                      : task.completedAt,
              }
            : task
        );
      });

      if (completedStatus && statusChanged) {
        setReminders((prev) =>
          prev.map((reminder) =>
            reminder.taskId === taskId && !reminder.readAt
              ? { ...reminder, readAt: now }
              : reminder
          )
        );
      }

      if (reminderPayload) {
        pushReminder(reminderPayload);
        notifyInfo(
          "Task reassigned",
          "The assignee will see a reminder in their notifications."
        );
      }

      if (taskTitle) {
        if (statusChanged && updates.status) {
          notifyUpdated(
            "Task",
            `${taskTitle} (${getTaskStatusLabel(updates.status)})`
          );
        } else {
          notifyUpdated("Task", taskTitle);
        }
      }
    },
    [pushReminder]
  );

  const updateDealTaskStatus = React.useCallback(
    (taskId: string, status: TaskStatus) => {
      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toISOString();
      let taskTitle: string | undefined;

      setDealTasks((prev) =>
        prev.map((task) => {
          if (task.id !== taskId) return task;

          taskTitle = task.title;
          return {
            ...task,
            status,
            completedAt: status === "completed" ? today : undefined,
          };
        })
      );

      if (status === "completed") {
        setReminders((prev) =>
          prev.map((reminder) =>
            reminder.taskId === taskId && !reminder.readAt
              ? { ...reminder, readAt: now }
              : reminder
          )
        );
      }

      if (taskTitle) {
        notifyUpdated("Task", `${taskTitle} (${getTaskStatusLabel(status)})`);
      }
    },
    []
  );

  const deleteDealTask = React.useCallback((taskId: string) => {
    let taskTitle: string | undefined;

    setDealTasks((prev) => {
      const task = prev.find((entry) => entry.id === taskId);
      taskTitle = task?.title;
      return prev.filter((entry) => entry.id !== taskId);
    });
    setReminders((prev) =>
      prev.filter((reminder) => reminder.taskId !== taskId)
    );
    notifyDeleted("Task", taskTitle);
  }, []);

  const addDealActivity = React.useCallback(
    (
      activity: Omit<DealActivity, "id" | "createdAt"> & {
        recorderName?: string;
      }
    ) => {
      const trimmed = activity.summary.trim();
      if (!trimmed) return;

      const assignedToUserId = activity.assignedToUserId;
      const shouldRemind =
        assignedToUserId &&
        assignedToUserId !== activity.loggedByUserId &&
        isAssignableActivityType(activity.type);

      let activityId = "";

      setDealActivities((prev) => {
        activityId = createDealActivityId(prev);
        return [
          ...prev,
          {
            ...activity,
            id: activityId,
            summary: trimmed,
            createdAt: new Date().toISOString(),
          },
        ];
      });
      touchDealLastActivity(activity.dealId, activity.occurredAt);

      if (shouldRemind && assignedToUserId) {
        const kind: CrmReminderKind =
          activity.type === "visit" ? "visit_assigned" : "meeting_assigned";

        pushReminder({
          userId: assignedToUserId,
          kind,
          title: trimmed,
          message: `${activity.recorderName ?? "Someone"} assigned you a ${activity.type}`,
          dueDate: activity.occurredAt,
          dealId: activity.dealId,
          activityId,
        });
        notifyInfo(
          "Assignment recorded",
          "The assignee will see a reminder in their notifications."
        );
      }

      notifyCreated("Activity logged");
    },
    [pushReminder, touchDealLastActivity]
  );

  const updateDealActivity = React.useCallback(
    (
      activityId: string,
      updates: Partial<DealActivity> & { recorderName?: string }
    ) => {
      let previousDealId: string | undefined;
      let nextDealId: string | undefined;
      let activityDate: string | undefined;
      let reminderPayload: Omit<
        CrmReminder,
        "id" | "createdAt" | "readAt"
      > | null = null;

      setDealActivities((prev) => {
        const existing = prev.find((activity) => activity.id === activityId);
        if (!existing) return prev;

        const type = updates.type ?? existing.type;
        const assignedToUserId =
          updates.assignedToUserId !== undefined
            ? updates.assignedToUserId
            : existing.assignedToUserId;
        const summary = updates.summary?.trim() || existing.summary;

        previousDealId = existing.dealId;
        nextDealId = updates.dealId ?? existing.dealId;
        activityDate = updates.occurredAt ?? existing.occurredAt;

        const reassigned =
          updates.assignedToUserId !== undefined &&
          updates.assignedToUserId !== existing.assignedToUserId;

        if (
          reassigned &&
          assignedToUserId &&
          assignedToUserId !== existing.loggedByUserId &&
          isAssignableActivityType(type)
        ) {
          const kind: CrmReminderKind =
            type === "visit" ? "visit_assigned" : "meeting_assigned";

          reminderPayload = {
            userId: assignedToUserId,
            kind,
            title: summary,
            message: `${updates.recorderName ?? "Someone"} assigned you a ${type}`,
            dueDate: activityDate,
            dealId: nextDealId,
            activityId,
          };
        }

        return prev.map((activity) =>
          activity.id === activityId
            ? {
                ...activity,
                ...updates,
                summary,
              }
            : activity
        );
      });

      if (previousDealId && activityDate) {
        touchDealLastActivity(previousDealId, activityDate);
      }
      if (nextDealId && nextDealId !== previousDealId && activityDate) {
        touchDealLastActivity(nextDealId, activityDate);
      }

      if (reminderPayload) {
        pushReminder(reminderPayload);
        notifyInfo(
          "Activity reassigned",
          "The assignee will see a reminder in their notifications."
        );
      }

      notifyUpdated("Activity");
    },
    [pushReminder, touchDealLastActivity]
  );

  const deleteDealActivity = React.useCallback((activityId: string) => {
    setDealActivities((prev) =>
      prev.filter((activity) => activity.id !== activityId)
    );
    setReminders((prev) =>
      prev.filter((reminder) => reminder.activityId !== activityId)
    );
    notifyDeleted("Activity");
  }, []);

  const markReminderRead = React.useCallback((reminderId: string) => {
    const now = new Date().toISOString();
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === reminderId ? { ...reminder, readAt: now } : reminder
      )
    );
  }, []);

  const markAllRemindersRead = React.useCallback((userId: string) => {
    const now = new Date().toISOString();
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.userId === userId && !reminder.readAt
          ? { ...reminder, readAt: now }
          : reminder
      )
    );
  }, []);

  const checkIn = React.useCallback((userId: string) => {
    const today = getTodayDateString();
    const now = new Date().toISOString();
    let didCheckIn = false;

    setAttendanceRecords((prev) => {
      const existing = prev.find(
        (record) => record.userId === userId && record.date === today
      );

      if (existing?.checkInAt) {
        return prev;
      }

      didCheckIn = true;

      if (existing) {
        return prev.map((record) =>
          record.id === existing.id ? { ...record, checkInAt: now } : record
        );
      }

      return [
        ...prev,
        {
          id: `att-${Date.now()}`,
          userId,
          date: today,
          checkInAt: now,
        },
      ];
    });

    if (didCheckIn) {
      notifyCreated("Attendance", "Checked in for today");
    } else {
      notifyError("Already checked in", "You have already checked in today.");
    }
  }, []);

  const checkOut = React.useCallback((userId: string) => {
    const today = getTodayDateString();
    const now = new Date().toISOString();
    let didCheckOut = false;
    let needsCheckIn = false;
    let alreadyCheckedOut = false;

    setAttendanceRecords((prev) => {
      const existing = prev.find(
        (record) => record.userId === userId && record.date === today
      );

      if (!existing?.checkInAt) {
        needsCheckIn = true;
        return prev;
      }

      if (existing.checkOutAt) {
        alreadyCheckedOut = true;
        return prev;
      }

      didCheckOut = true;

      return prev.map((record) =>
        record.id === existing.id ? { ...record, checkOutAt: now } : record
      );
    });

    if (didCheckOut) {
      notifyUpdated("Attendance", "Checked out for today");
    } else if (needsCheckIn) {
      notifyError("Check in first", "You need to check in before checking out.");
    } else if (alreadyCheckedOut) {
      notifyError("Already checked out", "You have already checked out today.");
    }
  }, []);

  const addPipelineStage = React.useCallback((name: string, color: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setPipelineStages((prev) => {
      let id = slugifyStageId(trimmed);
      const existingIds = new Set(prev.map((s) => s.id));
      let suffix = 2;
      while (existingIds.has(id)) {
        id = `${slugifyStageId(trimmed)}-${suffix}`;
        suffix += 1;
      }

      return [...prev, { id, name: trimmed, color, kind: "open" }];
    });
    notifyCreated("Pipeline stage", trimmed);
  }, []);

  const updatePipelineStage = React.useCallback(
    (
      stageId: string,
      updates: Partial<Pick<PipelineStageConfig, "name" | "color">>
    ) => {
      let stageName: string | undefined;

      setPipelineStages((prev) => {
        const existing = prev.find((stage) => stage.id === stageId);
        if (!existing) return prev;

        stageName = updates.name?.trim() || existing.name;
        return prev.map((stage) =>
          stage.id === stageId
            ? {
                ...stage,
                ...updates,
                name: updates.name?.trim() || stage.name,
              }
            : stage
        );
      });

      if (stageName) {
        notifyUpdated("Pipeline stage", stageName);
      }
    },
    []
  );

  const removePipelineStage = React.useCallback(
    (stageId: string) => {
      const stage = pipelineStages.find((entry) => entry.id === stageId);

      if (pipelineStages.length <= 1) {
        notifyError("Cannot delete stage", "At least one stage is required.");
        return false;
      }

      const hasDeals = deals.some((deal) => deal.stage === stageId);
      if (hasDeals) {
        notifyError(
          "Cannot delete stage",
          "Move deals out of this stage first."
        );
        return false;
      }

      setPipelineStages((prev) => prev.filter((entry) => entry.id !== stageId));
      notifyDeleted("Pipeline stage", stage?.name);
      return true;
    },
    [deals, pipelineStages]
  );

  const getCustomerById = React.useCallback(
    (id: string) => customers.find((c) => c.id === id),
    [customers]
  );

  const getContactById = React.useCallback(
    (id: string) => contacts.find((c) => c.id === id),
    [contacts]
  );

  const getProductById = React.useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const getDealById = React.useCallback(
    (id: string) => deals.find((d) => d.id === id),
    [deals]
  );

  const getStageById = React.useCallback(
    (id: string) => pipelineStages.find((s) => s.id === id),
    [pipelineStages]
  );

  const getContactsByCustomerId = React.useCallback(
    (customerId: string) => contacts.filter((c) => c.customerId === customerId),
    [contacts]
  );

  const getDealsByCustomerId = React.useCallback(
    (customerId: string) => deals.filter((d) => d.customerId === customerId),
    [deals]
  );

  const value = React.useMemo(
    () => ({
      customers,
      contacts,
      products,
      deals,
      dealTasks,
      dealActivities,
      reminders,
      attendanceRecords,
      pipelineStages,
      masterData,
      addMasterDataItem,
      removeMasterDataItem,
      renameMasterDataItem,
      addCustomer,
      updateCustomer,
      importCustomers,
      deleteCustomer,
      addContact,
      updateContact,
      deleteContact,
      addProduct,
      updateProduct,
      deleteProduct,
      addDeal,
      updateDeal,
      moveDealToStage,
      addDealTask,
      updateDealTask,
      updateDealTaskStatus,
      deleteDealTask,
      addDealActivity,
      updateDealActivity,
      deleteDealActivity,
      markReminderRead,
      markAllRemindersRead,
      checkIn,
      checkOut,
      addPipelineStage,
      updatePipelineStage,
      removePipelineStage,
      getCustomerById,
      getContactById,
      getProductById,
      getDealById,
      getStageById,
      getContactsByCustomerId,
      getDealsByCustomerId,
    }),
    [
      customers,
      contacts,
      products,
      deals,
      dealTasks,
      dealActivities,
      reminders,
      attendanceRecords,
      pipelineStages,
      masterData,
      addMasterDataItem,
      removeMasterDataItem,
      renameMasterDataItem,
      addCustomer,
      updateCustomer,
      importCustomers,
      deleteCustomer,
      addContact,
      updateContact,
      deleteContact,
      addProduct,
      updateProduct,
      deleteProduct,
      addDeal,
      updateDeal,
      moveDealToStage,
      addDealTask,
      updateDealTask,
      updateDealTaskStatus,
      deleteDealTask,
      addDealActivity,
      updateDealActivity,
      deleteDealActivity,
      markReminderRead,
      markAllRemindersRead,
      checkIn,
      checkOut,
      addPipelineStage,
      updatePipelineStage,
      removePipelineStage,
      getCustomerById,
      getContactById,
      getProductById,
      getDealById,
      getStageById,
      getContactsByCustomerId,
      getDealsByCustomerId,
    ]
  );

  return (
    <CrmDataContext.Provider value={value}>{children}</CrmDataContext.Provider>
  );
}

export function useCrmData() {
  const context = React.useContext(CrmDataContext);
  if (!context) {
    throw new Error("useCrmData must be used within CrmDataProvider");
  }
  return context;
}
