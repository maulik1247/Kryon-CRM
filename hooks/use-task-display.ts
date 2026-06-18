"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-provider";
import { useCrmLookups } from "@/hooks/use-crm-lookups";
import { isTaskOpen } from "@/lib/task-constants";
import { getUserName } from "@/lib/user-helpers";
import type { DealTask } from "@/lib/types";

export function useTaskDisplayHelpers() {
  const { users } = useAuth();
  const { customerNameByDealId } = useCrmLookups();

  const todayStart = React.useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }, []);

  const customerNameByDealIdFn = React.useCallback(
    (dealId: string) => customerNameByDealId.get(dealId),
    [customerNameByDealId]
  );

  const addedByName = React.useCallback(
    (userId: string) => getUserName(users, userId),
    [users]
  );

  const assignedToName = React.useCallback(
    (userId: string) => getUserName(users, userId),
    [users]
  );

  const isOverdue = React.useCallback(
    (task: DealTask) => {
      if (!isTaskOpen(task.status)) return false;
      return new Date(`${task.dueDate}T00:00:00`).getTime() < todayStart;
    },
    [todayStart]
  );

  return {
    customerNameByDealIdFn,
    addedByName,
    assignedToName,
    isOverdue,
    todayStart,
  };
}
