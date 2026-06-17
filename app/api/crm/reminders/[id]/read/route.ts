import { apiError, apiJson } from "@/lib/server/api-response";
import { requireCrmUser } from "@/lib/server/auth-session";
import { markReminderRead } from "@/lib/server/crm-service";

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireCrmUser();
    const updated = await markReminderRead(params.id, currentUser.id);
    return apiJson(updated);
  } catch (error) {
    return apiError(error);
  }
}
