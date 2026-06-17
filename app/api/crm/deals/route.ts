import { apiError, apiJson } from "@/lib/server/api-response";
import { requireCrmUser } from "@/lib/server/auth-session";
import {
  createDeal,
  deleteDeal,
  moveDealToStage,
  updateDeal,
} from "@/lib/server/crm-service";
import type { Deal } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const currentUser = await requireCrmUser();
    const deal = (await request.json()) as Deal;
    const created = await createDeal(deal, currentUser);
    return apiJson(created, 201);
  } catch (error) {
    return apiError(error);
  }
}
