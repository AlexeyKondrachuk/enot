import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, createAdminSession } from "@/lib/admin-auth";
import { checkAdminLogin, getLoginIp } from "@/lib/admin-login-rate-limit";

export const runtime = "nodejs";

function allowedOrigins(request: NextRequest) {
  return new Set([
    new URL(request.url).origin,
    "https://stylishly-simple-chicken.cloudpub.ru",
    process.env.APP_ORIGIN,
    process.env.CHAT_ALLOWED_ORIGIN,
  ].filter((origin): origin is string => Boolean(origin)));
}

export async function POST(request: NextRequest) {
  const requestOrigin = request.headers.get("origin");
  const origins = allowedOrigins(request);
  if (requestOrigin && !origins.has(requestOrigin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const redirectOrigin = requestOrigin && origins.has(requestOrigin) ? requestOrigin : new URL(request.url).origin;

  const form = await request.formData().catch(() => null);
  const login = checkAdminLogin(getLoginIp(request.headers), form?.get("password"));
  if (!login.ok) {
    const reason = login.status === 429 ? "limited" : "invalid";
    return NextResponse.redirect(new URL(`/admin/login?error=${reason}`, redirectOrigin), 303);
  }

  try {
    const session = createAdminSession();
    const response = NextResponse.redirect(new URL("/admin/chat", redirectOrigin), 303);
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
    return NextResponse.redirect(new URL("/admin/login?error=config", redirectOrigin), 303);
  }
}
