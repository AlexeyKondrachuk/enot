import type { NextRequest } from "next/server";

export const chatCookieName = "enot_chat";
export const maxMessageLength = 2000;

export function normalizeMessage(value: unknown) {
  if (typeof value !== "string") return null;
  const text = value.trim().replace(/\s{3,}/g, "  ");
  return text.length > 0 && text.length <= maxMessageLength ? text : null;
}

export function getVisitorToken(request: NextRequest) {
  return request.cookies.get(chatCookieName)?.value ?? null;
}

