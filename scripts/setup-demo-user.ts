import { createClerkClient } from "@clerk/backend";
import { PrismaClient } from "@prisma/client";
import { DEMO_USER } from "../lib/demo-auth";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});
const prisma = new PrismaClient();

async function verifyDemoEmail(clerkUserId: string) {
  const user = await clerk.users.getUser(clerkUserId);

  for (const email of user.emailAddresses) {
    if (email.emailAddress.toLowerCase() === DEMO_USER.email) {
      await clerk.emailAddresses.updateEmailAddress(email.id, {
        verified: true,
      });
      console.log("Verified demo email address");
    }
  }
}

async function main() {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is required");
  }

  const existing = await clerk.users.getUserList({
    emailAddress: [DEMO_USER.email],
  });

  let clerkUserId: string;

  if (existing.data.length > 0) {
    clerkUserId = existing.data[0].id;
    await clerk.users.updateUser(clerkUserId, {
      password: DEMO_USER.password,
      firstName: "Demo",
      lastName: "Client",
      skipPasswordChecks: true,
    });
    console.log("Updated Clerk demo user password");
  } else {
    const created = await clerk.users.createUser({
      emailAddress: [DEMO_USER.email],
      password: DEMO_USER.password,
      firstName: "Demo",
      lastName: "Client",
      skipPasswordChecks: true,
      skipPasswordRequirement: true,
    });
    clerkUserId = created.id;
    console.log("Created Clerk demo user");
  }

  await verifyDemoEmail(clerkUserId);

  await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    create: {
      id: "user-demo",
      clerkId: clerkUserId,
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      role: "admin",
      active: true,
    },
    update: {
      clerkId: clerkUserId,
      name: DEMO_USER.name,
      role: "admin",
      active: true,
    },
  });

  console.log("Demo user ready:");
  console.log(`  Email:    ${DEMO_USER.email}`);
  console.log(`  Password: ${DEMO_USER.password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
