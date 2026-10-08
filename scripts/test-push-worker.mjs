import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");

for (const windows of [[], [{ visibilityState: "hidden" }], [{ visibilityState: "visible" }]]) {
  const handlers = new Map();
  const notifications = [];
  let opened;
  const context = {
    URL,
    Response,
    console,
    self: {
      location: { origin: "https://enotdev.su" },
      addEventListener: (name, handler) => handlers.set(name, handler),
      navigator: {
        setAppBadge: async () => { throw new Error("Badge unavailable"); },
        clearAppBadge: async () => { throw new Error("Badge unavailable"); },
      },
      registration: { showNotification: async (...args) => notifications.push(args) },
      clients: {
        matchAll: async () => windows,
        openWindow: async (url) => { opened = url; },
      },
    },
  };
  vm.runInNewContext(source, context);
  let completion;
  handlers.get("push")({
    data: { json: () => ({ title: "New message", url: "/admin/chat" }) },
    waitUntil: (promise) => { completion = promise; },
  });
  await completion;
  assert.equal(notifications.length, 1, "Push must show even with a visible window or broken badge");
  if (windows.length === 0) {
    handlers.get("notificationclick")({
      notification: { close() {}, data: { url: "/admin/chat" } },
      waitUntil: (promise) => { completion = promise; },
    });
    await completion;
    assert.equal(opened, "https://enotdev.su/admin/chat", "Broken badge must not prevent opening chat");
  }
}

console.log("Push worker: closed, hidden, visible and badge failure checks passed");
