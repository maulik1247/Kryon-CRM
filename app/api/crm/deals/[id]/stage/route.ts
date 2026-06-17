import { apiError, apiJson } from "@/lib/server/api-response";
import { requireCrmUser } from "@/lib/server/auth-session";
import { moveDealToStage } from "@/lib/server/crm-service";
import type { PipelineStage } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireCrmUser();
    const { stage } = (await request.json()) as { stage: PipelineStage };
    const updated = await moveDealToStage(params.id, stage, currentUser);
    return apiJson(updated);
  } catch (error) {
    return apiError(error);
  }
}
