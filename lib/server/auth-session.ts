import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { mapUser } from "@/lib/server/crm-mappers";
import type { CrmUser } from "@/lib/types";

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function syncClerkUserToDb(): Promise<CrmUser | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.emailAddresses.find(
      (entry) => entry.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) return null;

  const normalizedEmail = email.toLowerCase();
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    normalizedEmail;

  const existingByClerk = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });
  if (existingByClerk) {
    return mapUser(existingByClerk);
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingByEmail) {
    const updated = await prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        clerkId: clerkUser.id,
        name: existingByEmail.name || name,
      },
    });
    return mapUser(updated);
  }

  const created = await prisma.user.create({
    data: {
      id: `user-${Date.now()}`,
      clerkId: clerkUser.id,
      email: normalizedEmail,
      name,
      role: "sales_rep",
      active: true,
    },
  });
  return mapUser(created);
}

export async function requireCrmUser(): Promise<CrmUser> {
  const { userId } = await auth();
  if (!userId) {
    throw new AuthError("Unauthorized", 401);
  }

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    const synced = await syncClerkUserToDb();
    if (!synced) {
      throw new AuthError("Unauthorized", 401);
    }
    if (!synced.active) {
      throw new AuthError(
        "Your account is pending approval. Contact an administrator.",
        403
      );
    }
    return synced;
  }

  const mapped = mapUser(user);
  if (!mapped.active) {
    throw new AuthError(
      "Your account is pending approval. Contact an administrator.",
      403
    );
  }
  return mapped;
}
