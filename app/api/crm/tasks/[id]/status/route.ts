import { apiError, apiJson } from "@/lib/server/api-response";
import { requireCrmUser } from "@/lib/server/auth-session";
import { updateDealTaskStatus } from "@/lib/server/crm-service";
import type { TaskStatus } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireCrmUser();
    const { status } = (await request.json()) as { status: TaskStatus };
    const updated = await updateDealTaskStatus(params.id, status, currentUser);
    return apiJson(updated);
  } catch (error) {
    return apiError(error);
  }
}
