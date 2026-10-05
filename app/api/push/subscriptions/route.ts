import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SubscriptionBody = {
  endpoint?: unknown;
  keys?: { p256dh?: unknown; auth?: unknown };
};

function validString(value: unknown, maxLength: number) {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength ? value : null;
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as SubscriptionBody | null;
  const endpoint = validString(body?.endpoint, 4000);
  const p256dh = validString(body?.keys?.p256dh, 1000);
  const auth = validString(body?.keys?.auth, 1000);
  if (!endpoint || !p256dh || !auth || !endpoint.startsWith("https://")) {
    return NextResponse.json({ error: "Invalid push subscription" }, { status: 400 });
  }

  await getPrisma().pushSubscription.upsert({
    where: { endpoint },
    update: { p256dh, auth, userAgent: request.headers.get("user-agent")?.slice(0, 500) },
    create: { endpoint, p256dh, auth, userAgent: request.headers.get("user-agent")?.slice(0, 500) },
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as SubscriptionBody | null;
  const endpoint = validString(body?.endpoint, 4000);
  if (!endpoint) return NextResponse.json({ error: "Invalid push subscription" }, { status: 400 });
  await getPrisma().pushSubscription.deleteMany({ where: { endpoint } });
  return new NextResponse(null, { status: 204 });
}
