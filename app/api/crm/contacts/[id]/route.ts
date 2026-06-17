import { mapContact } from "@/lib/server/crm-mappers";
import { apiError, apiJson } from "@/lib/server/api-response";
import { requireCrmUser } from "@/lib/server/auth-session";
import { deleteEntity, patchEntity } from "@/lib/server/crm-service";
import type { Contact } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireCrmUser();
    const updates = (await request.json()) as Partial<Contact>;
    const updated = await patchEntity("contact", params.id, updates, mapContact);
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
    await requireCrmUser();
    await deleteEntity("contact", params.id);
    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
