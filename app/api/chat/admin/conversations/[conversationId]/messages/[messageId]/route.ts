import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string; messageId: string }> },
) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { conversationId, messageId } = await params;
  const prisma = getPrisma();
  const removed = await prisma.message.deleteMany({ where: { id: messageId, conversationId } });
  if (removed.count === 0) return NextResponse.json({ error: "Message not found" }, { status: 404 });

  const latest = await prisma.message.findFirst({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: latest?.createdAt ?? new Date() },
  });
  return new NextResponse(null, { status: 204 });
}
