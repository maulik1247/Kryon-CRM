import { apiError, apiJson } from "@/lib/server/api-response";
import { requireCrmUser } from "@/lib/server/auth-session";
import { upsertEntityPayload } from "@/lib/server/crm-service";
import type { Customer } from "@/lib/types";

export async function POST(request: Request) {
  try {
    await requireCrmUser();
    const customer = (await request.json()) as Customer;
    const saved = await upsertEntityPayload("customer", customer);
    return apiJson(saved, 201);
  } catch (error) {
    return apiError(error);
  }
}
