import { apiError, apiJson } from "@/lib/server/api-response";
import { requireCrmUser } from "@/lib/server/auth-session";
import { upsertEntityPayload } from "@/lib/server/crm-service";
import type { DealActivity } from "@/lib/types";

export async function POST(request: Request) {
  try {
    await requireCrmUser();
    const activity = (await request.json()) as DealActivity;
    const saved = await upsertEntityPayload("dealActivity", activity);
    return apiJson(saved, 201);
  } catch (error) {
    return apiError(error);
  }
}
