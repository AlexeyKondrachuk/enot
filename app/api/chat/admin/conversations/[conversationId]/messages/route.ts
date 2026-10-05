import { NextRequest, NextResponse } from "next/server";
import { MessageSender } from "@/generated/prisma/enums";
import { isAdminRequest } from "@/lib/admin-auth";
import { normalizeMessage } from "@/lib/chat";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { conversationId } = await params;
  const prisma = getPrisma();
  await prisma.message.updateMany({
    where: { conversationId, sender: MessageSender.VISITOR, readAt: null },
    data: { readAt: new Date() },
  });
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  return NextResponse.json(messages);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { conversationId } = await params;
  const body = await request.json().catch(() => null);
  const text = normalizeMessage(body?.text);
  if (!text) return NextResponse.json({ error: "Invalid message" }, { status: 400 });

  const message = await getPrisma().message.create({
    data: { conversationId, sender: MessageSender.OPERATOR, text },
  });
  await getPrisma().conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } });
  return NextResponse.json(message, { status: 201 });
}
