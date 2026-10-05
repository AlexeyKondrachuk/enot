import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { isExpiredPushSubscription, sendWebPush } from "@/lib/web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const prisma = getPrisma();
  const subscriptions = await prisma.pushSubscription.findMany();
  let delivered = 0;
  let failed = 0;

  await Promise.all(subscriptions.map(async (subscription) => {
    try {
      await sendWebPush(subscription, {
        title: "Уведомления включены",
        body: "Теперь новые обращения не потеряются.",
        url: "/admin/chat",
        tag: "enot-push-test",
        alwaysShow: true,
      });
      delivered += 1;
    } catch (error) {
      if (isExpiredPushSubscription(error)) {
        await prisma.pushSubscription.delete({ where: { id: subscription.id } });
      } else {
        failed += 1;
        console.error("Unable to send test push notification", error);
      }
    }
  }));

  if (delivered === 0) {
    return NextResponse.json({ delivered, failed, error: "Test notification was not delivered" }, { status: 502 });
  }
  return NextResponse.json({ delivered, failed });
}
