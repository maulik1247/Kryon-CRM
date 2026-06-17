import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function isPrismaConnectionError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message;
  return (
    message.includes("Can't reach database server") ||
    message.includes("Connection closed") ||
    message.includes("Connection terminated") ||
    message.includes("kind: Closed")
  );
}

function createPrismaClient() {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

  return client.$extends({
    query: {
      async $allOperations({ args, query }) {
        try {
          return await query(args);
        } catch (error) {
          if (!isPrismaConnectionError(error)) {
            throw error;
          }

          await client.$disconnect();
          return await query(args);
        }
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
