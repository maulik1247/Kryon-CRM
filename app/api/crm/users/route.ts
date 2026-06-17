import { isAdminRole } from "@/lib/role-permissions";
import { apiError, apiJson } from "@/lib/server/api-response";
import { AuthError, requireCrmUser } from "@/lib/server/auth-session";
import { createCrmUser } from "@/lib/server/crm-service";
import type { CrmUser } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const currentUser = await requireCrmUser();
    if (!isAdminRole(currentUser.role)) {
      throw new AuthError("Forbidden", 403);
    }
    const user = (await request.json()) as Omit<CrmUser, "id">;
    const created = await createCrmUser(user);
    return apiJson(created, 201);
  } catch (error) {
    return apiError(error);
  }
}
