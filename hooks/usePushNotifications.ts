"use client";

import { useCallback, useEffect, useState } from "react";

type PushState = "loading" | "unsupported" | "blocked" | "disabled" | "enabled" | "error";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) output[index] = raw.charCodeAt(index);
  return output;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushState>("loading");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      queueMicrotask(() => active && setState("unsupported"));
      return () => { active = false; };
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((registration) => registration.pushManager.getSubscription())
      .then(async (existing) => {
        if (!active) return;
        if (existing) {
          const syncResponse = await fetch("/api/push/subscriptions", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(existing.toJSON()),
          });
          if (!syncResponse.ok) throw new Error("Не удалось сохранить подписку на сервере");
        }
        setSubscription(existing);
        setState(existing ? "enabled" : Notification.permission === "denied" ? "blocked" : "disabled");
      })
      .catch((error) => {
        if (!active) return;
        setDetail(error instanceof Error ? error.message : "Не удалось проверить подписку");
        setState("error");
      });

    return () => { active = false; };
  }, []);

  const enable = useCallback(async () => {
    setBusy(true);
    setDetail(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "disabled");
        return;
      }

      const keyResponse = await fetch("/api/push/public-key");
      if (!keyResponse.ok) throw new Error("VAPID-ключи не настроены на сервере");
      const { publicKey } = await keyResponse.json() as { publicKey: string };
      const registration = await navigator.serviceWorker.ready;
      const created = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const saveResponse = await fetch("/api/push/subscriptions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(created.toJSON()),
      });
      if (!saveResponse.ok) {
        await created.unsubscribe();
        throw new Error("Unable to save push subscription");
      }
      setSubscription(created);
      const testResponse = await fetch("/api/push/test", { method: "POST" });
      if (!testResponse.ok) throw new Error("Подписка сохранена, но тестовое уведомление не доставлено");
      setState("enabled");
      setDetail("Тестовое уведомление отправлено");
    } catch (error) {
      setDetail(error instanceof Error ? error.message : "Не удалось включить уведомления");
      setState("error");
    } finally {
      setBusy(false);
    }
  }, []);

  const disable = useCallback(async () => {
    if (!subscription) return;
    setBusy(true);
    setDetail(null);
    try {
      await fetch("/api/push/subscriptions", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      await subscription.unsubscribe();
      setSubscription(null);
      setState("disabled");
    } catch (error) {
      setDetail(error instanceof Error ? error.message : "Не удалось отключить уведомления");
      setState("error");
    } finally {
      setBusy(false);
    }
  }, [subscription]);

  return { state, busy, detail, enable, disable };
}
