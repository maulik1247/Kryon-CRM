import { apiError, apiJson } from "@/lib/server/api-response";
import { requireCrmUser } from "@/lib/server/auth-session";
import { createDealTask } from "@/lib/server/crm-service";
import type { DealTask } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const currentUser = await requireCrmUser();
    const body = await request.json();
    const created = await createDealTask(body, currentUser);
    return apiJson(created, 201);
  } catch (error) {
    return apiError(error);
  }
}
