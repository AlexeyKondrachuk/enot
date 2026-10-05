import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, createAdminSession } from "@/lib/admin-auth";
import { checkAdminLogin, getLoginIp } from "@/lib/admin-login-rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const login = checkAdminLogin(getLoginIp(request.headers), body?.password);
  if (!login.ok) return NextResponse.json({ error: login.error }, { status: login.status });
  try {
    const session = createAdminSession();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(adminCookieName, session.value, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: session.maxAge,
      priority: "high",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Авторизация не настроена" }, { status: 503 });
  }
}
