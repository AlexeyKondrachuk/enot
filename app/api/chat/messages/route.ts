import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { MessageSender } from "@/generated/prisma/enums";
import { chatCookieName, getVisitorToken, normalizeMessage } from "@/lib/chat";
import { notifyAdminAboutMessage } from "@/lib/admin-push";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const visitorToken = getVisitorToken(request);
  if (!visitorToken) return NextResponse.json({ conversationId: null, messages: [] });

  try {
    const prisma = getPrisma();
    const conversationRecord = await prisma.conversation.findUnique({
      where: { visitorToken },
      select: { id: true },
    });
    if (conversationRecord) {
      await prisma.message.updateMany({
        where: { conversationId: conversationRecord.id, sender: MessageSender.OPERATOR, readAt: null },
        data: { readAt: new Date() },
      });
    }
    const conversation = await prisma.conversation.findUnique({
      where: { visitorToken },
      select: {
        id: true,
        status: true,
        messages: { orderBy: { createdAt: "asc" }, take: 100 },
      },
    });

    return NextResponse.json({
      conversationId: conversation?.id ?? null,
      status: conversation?.status ?? null,
      messages: conversation?.messages ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Чат временно недоступен" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const text = normalizeMessage(body?.text);
  if (!text) return NextResponse.json({ error: "Введите сообщение до 2000 символов" }, { status: 400 });

  const visitorToken = getVisitorToken(request) ?? randomUUID();

  try {
    const prisma = getPrisma();
    const conversation = await prisma.conversation.upsert({
      where: { visitorToken },
      update: { status: "OPEN", lastMessageAt: new Date() },
      create: { visitorToken },
      select: { id: true },
    });

    const recentMessage = await prisma.message.findFirst({
      where: { conversationId: conversation.id, sender: MessageSender.VISITOR },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    if (recentMessage && Date.now() - recentMessage.createdAt.getTime() < 1000) {
      return NextResponse.json({ error: "Подождите секунду перед отправкой" }, { status: 429 });
    }

    const message = await prisma.message.create({
      data: { conversationId: conversation.id, sender: MessageSender.VISITOR, text },
    });
    await notifyAdminAboutMessage(conversation.id);

    const response = NextResponse.json(message, { status: 201 });
    response.cookies.set(chatCookieName, visitorToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Не удалось отправить сообщение" }, { status: 503 });
  }
}
