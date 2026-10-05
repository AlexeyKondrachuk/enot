// lib/unread-badge.ts
//
// Счётчик непрочитанных: заголовок вкладки "(2) Енот" + бейдж на иконке
// приложения (setAppBadge работает в Chrome/Edge и установленных PWA,
// Firefox/Safari молча игнорируют).

let count = 0;
let baseTitle: string | null = null;

// id сообщений, уже учтённых в бейдже — защита от дублей
// (одно сообщение может прийти и через сокет, и через поллинг)
const seenBadgeIds = new Set<string>();

function apply() {
  if (typeof document === "undefined") return;
  if (baseTitle === null) baseTitle = document.title;
  document.title = count > 0 ? `(${count}) ${baseTitle}` : baseTitle;

  const nav = navigator as Navigator & {
    setAppBadge?: (n?: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
  };
  try {
    if (count > 0) void nav.setAppBadge?.(Math.min(count, 99));
    else void nav.clearAppBadge?.();
  } catch {
    /* API не поддерживается — не критично */
  }
}

/** Учитывает сообщение в бейдже ровно один раз. */
export function bumpUnreadFor(messageId: string) {
  if (typeof document === "undefined") return;
  if (seenBadgeIds.has(messageId)) return;
  seenBadgeIds.add(messageId);
  count += 1;
  apply();
}

/** Полный сброс счётчика (возврат во вкладку). */
export function clearUnread() {
  count = 0;
  apply();
}

/** Сброс при возврате во вкладку. Возвращает функцию очистки. */
export function initUnreadReset() {
  if (typeof document === "undefined") return () => {};
  const onVisible = () => {
    if (document.visibilityState === "visible") clearUnread();
  };
  document.addEventListener("visibilitychange", onVisible);
  return () => document.removeEventListener("visibilitychange", onVisible);
}