import { apiError, apiJson } from "@/lib/server/api-response";
import { requireCrmUser } from "@/lib/server/auth-session";
import {
  deleteDealTask,
  updateDealTask,
  updateDealTaskStatus,
} from "@/lib/server/crm-service";
import type { DealTask, TaskStatus } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireCrmUser();
    const updates = (await request.json()) as Partial<DealTask> & {
      assignerName?: string;
    };
    const updated = await updateDealTask(params.id, updates, currentUser);
    return apiJson(updated);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireCrmUser();
    const ok = await deleteDealTask(params.id, currentUser);
    return apiJson({ ok });
  } catch (error) {
    return apiError(error);
  }
}
