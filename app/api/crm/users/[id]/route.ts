import { isAdminRole } from "@/lib/role-permissions";
import { apiError, apiJson } from "@/lib/server/api-response";
import { AuthError, requireCrmUser } from "@/lib/server/auth-session";
import { deleteCrmUser, updateCrmUser } from "@/lib/server/crm-service";
import type { CrmUser } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireCrmUser();
    if (!isAdminRole(currentUser.role)) {
      throw new AuthError("Forbidden", 403);
    }
    const updates = (await request.json()) as Partial<CrmUser>;
    const updated = await updateCrmUser(params.id, updates);
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
    if (!isAdminRole(currentUser.role)) {
      throw new AuthError("Forbidden", 403);
    }
    await deleteCrmUser(params.id);
    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
