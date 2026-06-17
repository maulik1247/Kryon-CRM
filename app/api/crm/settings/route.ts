import { isAdminRole } from "@/lib/role-permissions";
import { apiError, apiJson } from "@/lib/server/api-response";
import { AuthError, requireCrmUser } from "@/lib/server/auth-session";
import { updateAppSettings } from "@/lib/server/crm-service";

export async function PATCH(request: Request) {
  try {
    const currentUser = await requireCrmUser();
    if (!isAdminRole(currentUser.role)) {
      throw new AuthError("Forbidden", 403);
    }
    const updates = await request.json();
    await updateAppSettings(updates);
    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
