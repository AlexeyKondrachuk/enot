import webpush from "web-push";

export type StoredPushSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export type PushPayload = {
  title: string;
  body: string;
  url: string;
  tag?: string;
  alwaysShow?: boolean;
};

function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:dev@enotdev.su";
  if (!publicKey || !privateKey || publicKey.startsWith("generate-with-") || privateKey.startsWith("generate-with-")) {
    throw new Error("VAPID keys are not configured");
  }
  return { publicKey, privateKey, subject };
}

export function getVapidPublicKey() {
  return getVapidConfig().publicKey;
}

export async function sendWebPush(subscription: StoredPushSubscription, payload: PushPayload) {
  const { publicKey, privateKey, subject } = getVapidConfig();
  webpush.setVapidDetails(subject, publicKey, privateKey);
  await webpush.sendNotification({
    endpoint: subscription.endpoint,
    keys: { p256dh: subscription.p256dh, auth: subscription.auth },
  }, JSON.stringify(payload), { TTL: 60 * 60 });
}

export function isExpiredPushSubscription(error: unknown) {
  if (!error || typeof error !== "object" || !("statusCode" in error)) return false;
  return error.statusCode === 404 || error.statusCode === 410;
}
