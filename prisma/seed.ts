import { PrismaClient, Prisma } from "@prisma/client";
import {
  customers,
  contacts,
  products,
  suppliers,
  deals,
  dealTasks,
  dealActivities,
  reminders,
  documentExchanges,
} from "../lib/mock-data";
import { DEFAULT_USERS } from "../lib/default-users";
import { DEFAULT_PIPELINE_STAGES } from "../lib/default-pipeline-stages";
import { DEFAULT_MASTER_DATA } from "../lib/default-master-data";

const prisma = new PrismaClient();

function json<T>(value: T): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue;
}

async function main() {
  await prisma.crmReminder.deleteMany();
  await prisma.documentExchange.deleteMany();
  await prisma.dealActivity.deleteMany();
  await prisma.dealTask.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();
  await prisma.appSettings.deleteMany();

  for (const user of DEFAULT_USERS) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email.toLowerCase(),
        name: user.name,
        role: user.role,
        active: user.active,
      },
    });
  }

  for (const user of DEFAULT_USERS) {
    if (user.reportsToUserId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { reportsToUserId: user.reportsToUserId },
      });
    }
  }

  await prisma.appSettings.create({
    data: {
      id: "default",
      pipelineStages: json(DEFAULT_PIPELINE_STAGES),
      masterData: json(DEFAULT_MASTER_DATA),
    },
  });

  for (const row of customers) {
    await prisma.customer.create({
      data: { id: row.id, payload: json(row) },
    });
  }
  for (const row of contacts) {
    await prisma.contact.create({ data: { id: row.id, payload: json(row) } });
  }
  for (const row of products) {
    await prisma.product.create({ data: { id: row.id, payload: json(row) } });
  }
  for (const row of suppliers) {
    await prisma.supplier.create({ data: { id: row.id, payload: json(row) } });
  }
  for (const row of deals) {
    await prisma.deal.create({ data: { id: row.id, payload: json(row) } });
  }
  for (const row of dealTasks) {
    await prisma.dealTask.create({ data: { id: row.id, payload: json(row) } });
  }
  for (const row of dealActivities) {
    await prisma.dealActivity.create({ data: { id: row.id, payload: json(row) } });
  }
  for (const row of reminders) {
    await prisma.crmReminder.create({ data: { id: row.id, payload: json(row) } });
  }
  for (const row of documentExchanges) {
    await prisma.documentExchange.create({
      data: { id: row.id, payload: json(row) },
    });
  }

  console.log("Seed complete:", {
    users: DEFAULT_USERS.length,
    customers: customers.length,
    deals: deals.length,
    tasks: dealTasks.length,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
