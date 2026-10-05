import { checkAdminPassword } from "@/lib/admin-auth";

const attempts = new Map<string, { count: number; resetAt: number }>();

export type LoginCheck =
  | { ok: true }
  | { ok: false; status: 401 | 429; error: string };

export function checkAdminLogin(ip: string, password: unknown): LoginCheck {
  const now = Date.now();
  const current = attempts.get(ip);
  if (current && current.resetAt > now && current.count >= 5) {
    return { ok: false, status: 429, error: "Слишком много попыток. Попробуйте позже." };
  }

  if (!checkAdminPassword(password)) {
    attempts.set(ip, {
      count: current && current.resetAt > now ? current.count + 1 : 1,
      resetAt: now + 15 * 60 * 1000,
    });
    return { ok: false, status: 401, error: "Неверный пароль" };
  }

  attempts.delete(ip);
  return { ok: true };
}

export function getLoginIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}
