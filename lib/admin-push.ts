import { getPrisma } from "@/lib/prisma";
import { getVapidPublicKey, isExpiredPushSubscription, sendWebPush } from "@/lib/web-push";

export async function notifyAdminAboutMessage(conversationId: string) {
  try {
    getVapidPublicKey();
  } catch {
    return;
  }

  const prisma = getPrisma();
  const subscriptions = await prisma.pushSubscription.findMany();
  await Promise.all(subscriptions.map(async (subscription) => {
    try {
      await sendWebPush(subscription, {
        title: "Новое сообщение",
        body: "В чате появилось новое обращение.",
        url: "/admin/chat",
        tag: `enot-chat-${conversationId}`,
      });
    } catch (error) {
      if (isExpiredPushSubscription(error)) {
        await prisma.pushSubscription.delete({ where: { id: subscription.id } });
      } else {
        console.error("Unable to send push notification", error);
      }
    }
  }));
}
