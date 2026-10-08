/* public/sw.js */

const DEFAULT_PUSH = {
  title: "Енот",
  body: "Новое сообщение в чате",
  url: "/admin/chat",
  tag: "enot-chat",
};

// Роуты должны совпадать с теми, что использует usePushNotifications
const PUBLIC_KEY_URL = "/api/push/public-key";
const SUBSCRIPTIONS_URL = "/api/push/subscriptions";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

/* ---------- Lifecycle ---------- */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

/* ---------- Push ---------- */

self.addEventListener("push", (event) => {
  let payload = { ...DEFAULT_PUSH };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    if (event.data) payload.body = event.data.text();
  }

  event.waitUntil((async () => {
    try {
      const windowClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });

      // Каждый push показывает системное уведомление, даже если открыта другая
      // страница сайта. Звук Socket.IO не заменяет уведомление в фоне.
      await self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: "/pwa-icon-192.png",
        badge: "/pwa-badge-mono-192.png", // монохромная маскируемая иконка
        tag: payload.tag || DEFAULT_PUSH.tag,
        renotify: true,
        lang: "ru",
        silent: false,
        vibrate: [120, 60, 120],
        data: { url: payload.url || DEFAULT_PUSH.url },
      });

      // Ошибка необязательного бейджа не должна мешать показу уведомления.
      if (windowClients.length === 0) {
        try { await self.navigator.setAppBadge?.(1); } catch { /* badge is optional */ }
      }
    } catch (error) {
      console.error("[sw] Не удалось показать уведомление:", error);
    }
  })());
});

/* ---------- Клик по уведомлению ---------- */

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || DEFAULT_PUSH.url, self.location.origin).href;

  event.waitUntil((async () => {
    // Открыли приложение — бейдж больше не нужен, дальше счётчиком управляет страница
    try { await self.navigator.clearAppBadge?.(); } catch { /* badge is optional */ }

    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });

    // 1. Нужная страница уже открыта — фокус без перезагрузки
    const exact = windows.find((client) => client.url === targetUrl);
    if (exact) {
      const focused = await exact.focus();
      if (focused) return;
    }

    // 2. Открыта другая страница этого сайта — ведём её на нужную и фокусируем
    const sameApp = windows.find((client) => {
      try { return new URL(client.url).origin === self.location.origin; } catch { return false; }
    });
    if (sameApp) {
      if ("navigate" in sameApp) {
        try { await sameApp.navigate(targetUrl); } catch { /* клиент не под контролем SW */ }
      }
      const focused = await sameApp.focus();
      if (focused) return;
    }

    // 3. Ничего не открыто (или фокус не удался) — новое окно / standalone-приложение
    return self.clients.openWindow(targetUrl);
  })());
});

/* ---------- Автопереподписка при смене ключей подписки ---------- */

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil((async () => {
    try {
      const res = await fetch(PUBLIC_KEY_URL);
      if (!res.ok) return;
      const { publicKey } = await res.json();
      if (!publicKey) return;

      const subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const save = await fetch(SUBSCRIPTIONS_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!save.ok) throw new Error(`Сохранение подписки вернуло ${save.status}`);
    } catch (error) {
      console.error("[sw] Не удалось переподписаться:", error);
    }
  })());
});

/* ---------- Офлайн-заглушка для навигаций (для установки PWA) ---------- */

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.mode !== "navigate") return;

  event.respondWith((async () => {
    try {
      return await fetch(request);
    } catch {
      return new Response(
        `<!doctype html><html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Нет сети</title></head>
<body style="font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0">
<p>Нет соединения. Проверьте интернет и попробуйте снова.</p>
</body></html>`,
        { status: 503, headers: { "content-type": "text/html; charset=utf-8" } },
      );
    }
  })());
});
