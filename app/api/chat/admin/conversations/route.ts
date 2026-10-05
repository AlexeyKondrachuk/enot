import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await getPrisma().conversation.findMany({
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return NextResponse.json(conversations);
}
