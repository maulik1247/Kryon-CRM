import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string; id: string }[];
    primary_email_address_id?: string;
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
  };
};

export async function POST(request: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const payload = await request.text();
  const headers = {
    "svix-id": request.headers.get("svix-id") ?? "",
    "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
    "svix-signature": request.headers.get("svix-signature") ?? "",
  };

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(payload, headers) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const email =
      event.data.email_addresses?.find(
        (entry) => entry.id === event.data.primary_email_address_id
      )?.email_address ?? event.data.email_addresses?.[0]?.email_address;

    if (!email) {
      return NextResponse.json({ ok: true });
    }

    const normalizedEmail = email.toLowerCase();
    const name =
      [event.data.first_name, event.data.last_name].filter(Boolean).join(" ") ||
      event.data.username ||
      normalizedEmail;

    const byClerk = await prisma.user.findUnique({
      where: { clerkId: event.data.id },
    });
    if (byClerk) {
      await prisma.user.update({
        where: { id: byClerk.id },
        data: { email: normalizedEmail, name: byClerk.name || name },
      });
      return NextResponse.json({ ok: true });
    }

    const byEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (byEmail) {
      await prisma.user.update({
        where: { id: byEmail.id },
        data: { clerkId: event.data.id },
      });
      return NextResponse.json({ ok: true });
    }

    if (event.type === "user.created") {
      await prisma.user.create({
        data: {
          id: `user-${Date.now()}`,
          clerkId: event.data.id,
          email: normalizedEmail,
          name,
          role: "sales_rep",
          active: true,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
