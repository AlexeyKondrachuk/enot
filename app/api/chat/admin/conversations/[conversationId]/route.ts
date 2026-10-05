import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { conversationId } = await params;
  const body = await request.json().catch(() => null);
  if (body?.status !== "OPEN" && body?.status !== "CLOSED") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const conversation = await getPrisma().conversation.update({
    where: { id: conversationId },
    data: { status: body.status },
  });
  return NextResponse.json(conversation);
}
