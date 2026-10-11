import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { conversationId } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }
  const data: { status?: "OPEN" | "CLOSED"; name?: string | null; archived?: boolean } = {};
  if ("status" in body) {
    if (body.status !== "OPEN" && body.status !== "CLOSED") return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    data.status = body.status;
  }
  if ("name" in body) {
    if (typeof body.name !== "string" || body.name.trim().length > 80) return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    data.name = body.name.trim() || null;
  }
  if ("archived" in body) {
    if (typeof body.archived !== "boolean") return NextResponse.json({ error: "Invalid archive flag" }, { status: 400 });
    data.archived = body.archived;
  }
  if (!Object.keys(data).length) return NextResponse.json({ error: "Empty update" }, { status: 400 });
  const prisma = getPrisma();
  const result = await prisma.conversation.updateMany({
    where: { id: conversationId },
    data,
  });
  if (!result.count) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  return NextResponse.json(conversation);
}
