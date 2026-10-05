import { createHmac, createHash, timingSafeEqual } from "node:crypto";

export type SocketIdentity =
  | { role: "visitor"; visitorToken: string; exp: number }
  | { role: "admin"; exp: number };
type SocketIdentityInput =
  | { role: "visitor"; visitorToken: string }
  | { role: "admin" };

function secret() {
  const value = process.env.CHAT_SESSION_SECRET;
  if (!value) throw new Error("CHAT_SESSION_SECRET is not configured");
  return value;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const a = createHash("sha256").update(left).digest();
  const b = createHash("sha256").update(right).digest();
  return timingSafeEqual(a, b);
}

export function createSocketToken(identity: SocketIdentityInput, lifetimeSeconds = 5 * 60) {
  const payload = Buffer.from(JSON.stringify({ ...identity, exp: Math.floor(Date.now() / 1000) + lifetimeSeconds })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySocketToken(token: unknown): SocketIdentity | null {
  if (typeof token !== "string") return null;
  const [payload, receivedSignature] = token.split(".");
  if (!payload || !receivedSignature) return null;

  try {
    if (!safeEqual(receivedSignature, sign(payload))) return null;
    const identity = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SocketIdentity;
    if (!identity.exp || identity.exp <= Date.now() / 1000) return null;
    if (identity.role === "visitor" && typeof identity.visitorToken === "string") return identity;
    if (identity.role === "admin") return identity;
    return null;
  } catch {
    return null;
  }
}
