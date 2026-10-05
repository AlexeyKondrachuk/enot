import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, isValidAdminSession } from "@/lib/admin-auth";
import { chatCookieName, getVisitorToken } from "@/lib/chat";
import { createSocketToken } from "@/lib/socket-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const isAdmin = isValidAdminSession(request.cookies.get(adminCookieName)?.value);
    const existingVisitorToken = getVisitorToken(request);
    const visitorToken = existingVisitorToken ?? randomUUID();
    const token = isAdmin
      ? createSocketToken({ role: "admin" })
      : createSocketToken({ role: "visitor", visitorToken });

    const response = NextResponse.json({
      token,
      role: isAdmin ? "admin" : "visitor",
      socketUrl: process.env.NEXT_PUBLIC_CHAT_SOCKET_URL ?? "http://localhost:3001",
    });

    if (!isAdmin && !existingVisitorToken) {
      response.cookies.set(chatCookieName, visitorToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }
    return response;
  } catch {
    return NextResponse.json({ error: "Socket authentication is not configured" }, { status: 503 });
  }
}
