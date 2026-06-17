import { apiError, apiJson } from "@/lib/server/api-response";
import { requireCrmUser } from "@/lib/server/auth-session";
import { markAllRemindersRead } from "@/lib/server/crm-service";

export async function POST() {
  try {
    const currentUser = await requireCrmUser();
    await markAllRemindersRead(currentUser.id);
    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
