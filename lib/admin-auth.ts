import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const adminCookieName = "enot_admin_session";
const sessionLifetime = 60 * 60 * 12;

function safeEqual(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function signature(value: string) {
  const secret = process.env.CHAT_SESSION_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function checkAdminPassword(password: unknown) {
  const expected = process.env.CHAT_ADMIN_PASSWORD;
  return typeof password === "string" && Boolean(expected) && safeEqual(password, expected!);
}

export function createAdminSession() {
  const expires = Math.floor(Date.now() / 1000) + sessionLifetime;
  const value = String(expires);
  const hash = signature(value);
  if (!hash) throw new Error("CHAT_SESSION_SECRET is not configured");
  return { value: `${value}.${hash}`, maxAge: sessionLifetime };
}

export function isValidAdminSession(session: string | undefined) {
  if (!session) return false;
  const [expiresRaw, receivedHash] = session.split(".");
  const expires = Number(expiresRaw);
  const expectedHash = signature(expiresRaw);
  if (!expires || !receivedHash || !expectedHash || expires <= Date.now() / 1000) return false;
  return safeEqual(receivedHash, expectedHash);
}

export function isAdminRequest(request: NextRequest) {
  return isValidAdminSession(request.cookies.get(adminCookieName)?.value);
}
