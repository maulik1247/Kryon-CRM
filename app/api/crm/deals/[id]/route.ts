import { apiError, apiJson } from "@/lib/server/api-response";
import { requireCrmUser } from "@/lib/server/auth-session";
import { deleteDeal, updateDeal } from "@/lib/server/crm-service";
import type { Deal } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireCrmUser();
    const updates = (await request.json()) as Partial<Deal>;
    const updated = await updateDeal(params.id, updates, currentUser);
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
    const ok = await deleteDeal(params.id, currentUser);
    return apiJson({ ok });
  } catch (error) {
    return apiError(error);
  }
}
