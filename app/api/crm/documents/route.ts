import { apiError, apiJson } from "@/lib/server/api-response";
import { requireCrmUser } from "@/lib/server/auth-session";
import { upsertEntityPayload } from "@/lib/server/crm-service";
import type { DocumentExchange } from "@/lib/types";

export async function POST(request: Request) {
  try {
    await requireCrmUser();
    const record = (await request.json()) as DocumentExchange;
    const saved = await upsertEntityPayload("documentExchange", record);
    return apiJson(saved, 201);
  } catch (error) {
    return apiError(error);
  }
}
