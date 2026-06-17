import { apiError, apiJson } from "@/lib/server/api-response";
import { requireCrmUser } from "@/lib/server/auth-session";
import { upsertEntityPayload } from "@/lib/server/crm-service";
import type { Supplier } from "@/lib/types";

export async function POST(request: Request) {
  try {
    await requireCrmUser();
    const supplier = (await request.json()) as Supplier;
    const saved = await upsertEntityPayload("supplier", supplier);
    return apiJson(saved, 201);
  } catch (error) {
    return apiError(error);
  }
}
