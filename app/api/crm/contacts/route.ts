import { apiError, apiJson } from "@/lib/server/api-response";
import { requireCrmUser } from "@/lib/server/auth-session";
import { upsertEntityPayload } from "@/lib/server/crm-service";
import type { Contact } from "@/lib/types";

export async function POST(request: Request) {
  try {
    await requireCrmUser();
    const contact = (await request.json()) as Contact;
    const saved = await upsertEntityPayload("contact", contact);
    return apiJson(saved, 201);
  } catch (error) {
    return apiError(error);
  }
}
