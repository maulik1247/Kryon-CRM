import { clerkClient } from "@clerk/nextjs/server";
import { apiError, apiJson } from "@/lib/server/api-response";
import { DEMO_USER } from "@/lib/demo-auth";

export async function POST() {
  try {
    const users = await clerkClient().users.getUserList({
      emailAddress: [DEMO_USER.email],
    });

    const demoUser = users.data[0];
    if (!demoUser) {
      return apiJson(
        { error: "Demo user not found. Run npm run setup:demo." },
        500
      );
    }

    const signInToken = await clerkClient().signInTokens.createSignInToken({
      userId: demoUser.id,
      expiresInSeconds: 120,
    });

    return apiJson({ token: signInToken.token });
  } catch (error) {
    return apiError(error);
  }
}
