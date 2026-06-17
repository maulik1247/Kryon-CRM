import { apiError, apiJson } from "@/lib/server/api-response";
import { requireCrmUser } from "@/lib/server/auth-session";
import { upsertEntityPayload } from "@/lib/server/crm-service";
import type { Product } from "@/lib/types";

export async function POST(request: Request) {
  try {
    await requireCrmUser();
    const product = (await request.json()) as Product;
    const saved = await upsertEntityPayload("product", product);
    return apiJson(saved, 201);
  } catch (error) {
    return apiError(error);
  }
}
