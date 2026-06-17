import { apiError, apiJson } from "@/lib/server/api-response";
import { requireCrmUser } from "@/lib/server/auth-session";
import { getBootstrap } from "@/lib/server/crm-service";

export async function GET() {
  try {
    const currentUser = await requireCrmUser();
    const data = await getBootstrap(currentUser);
    return apiJson(data);
  } catch (error) {
    return apiError(error);
  }
}
