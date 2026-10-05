import "dotenv/config";
import { createServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { MessageSender } from "../../generated/prisma/enums";
import type {
  SocketAck,
  SocketChatMessage,
  SocketHistory,
  SocketMessageDeletedEvent,
  SocketMessageEvent,
  SocketMessagesReadEvent,
} from "../../lib/chat-socket-types";
import { verifySocketToken, type SocketIdentity } from "../../lib/socket-token";
import { getVapidPublicKey, isExpiredPushSubscription, sendWebPush } from "../../lib/web-push";
import { prisma } from "./prisma";

type JoinPayload = { conversationId?: string };
type SendPayload = { conversationId?: string; text?: unknown };
type MessageActionPayload = { conversationId?: string; messageId?: string };
type JoinAck = (response: SocketAck<SocketHistory>) => void;
type SendAck = (response: SocketAck<SocketMessageEvent>) => void;
type DeleteAck = (response: SocketAck<SocketMessageDeletedEvent>) => void;

const port = Number(process.env.CHAT_SOCKET_PORT ?? 3001);
const allowedOrigins = [
  "http://localhost:3000",
  "https://stylishly-simple-chicken.cloudpub.ru",
  ...(process.env.CHAT_ALLOWED_ORIGIN?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? []),
];
const roomFor = (conversationId: string) => `conversation:${conversationId}`;

function serializeMessage(message: {
  id: string;
  conversationId: string;
  sender: MessageSender;
  text: string;
  createdAt: Date;
  readAt: Date | null;
}): SocketChatMessage {
  return {
    ...message,
    createdAt: message.createdAt.toISOString(),
    readAt: message.readAt?.toISOString() ?? null,
  };
}

function normalizeMessage(value: unknown) {
  if (typeof value !== "string") return null;
  const text = value.trim().replace(/\s{3,}/g, "  ");
  return text.length > 0 && text.length <= 2000 ? text : null;
}

async function findConversation(identity: SocketIdentity, requestedId?: string, createVisitor = false) {
  if (identity.role === "visitor") {
    if (createVisitor) {
      return prisma.conversation.upsert({
        where: { visitorToken: identity.visitorToken },
        update: {},
        create: { visitorToken: identity.visitorToken },
      });
    }
    return prisma.conversation.findUnique({ where: { visitorToken: identity.visitorToken } });
  }

  if (!requestedId) return null;
  return prisma.conversation.findUnique({ where: { id: requestedId } });
}

async function markAsRead(identity: SocketIdentity, conversationId: string) {
  const sender = identity.role === "admin" ? MessageSender.VISITOR : MessageSender.OPERATOR;
  const messages = await prisma.message.findMany({
    where: { conversationId, sender },
    select: { id: true },
  });
  if (messages.length === 0) return;

  const readAt = new Date();
  const messageIds = messages.map((message) => message.id);
  await prisma.message.updateMany({
    where: { id: { in: messageIds }, readAt: null },
    data: { readAt },
  });
  const event: SocketMessagesReadEvent = {
    conversationId,
    messageIds,
    readAt: readAt.toISOString(),
  };
  io.to(roomFor(conversationId)).to("admins").emit("messages:read", event);
}

async function notifyAdmins(conversationId: string, preview?: string) {
  try {
    getVapidPublicKey();
  } catch (error) {
    console.error("Push is not configured on socket server:", error);
    return;
  }


  const subscriptions = await prisma.pushSubscription.findMany();
  await Promise.all(subscriptions.map(async (subscription) => {
    try {
      await sendWebPush(subscription, {
        title: "Новое сообщение",
        body: preview ? `Енот-чат: ${preview.slice(0, 80)}` : "В чате появилось новое обращение.",
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

const httpServer = createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }
  response.writeHead(404).end();
});

const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, credentials: true },
});

io.use((socket, next) => {
  const identity = verifySocketToken(socket.handshake.auth?.token);
  if (!identity) return next(new Error("Unauthorized"));
  socket.data.identity = identity;
  next();
});

io.on("connection", (socket: Socket) => {
  const identity = socket.data.identity as SocketIdentity;
  if (identity.role === "admin") void socket.join("admins");

  socket.on("conversation:join", async (payload: JoinPayload = {}, acknowledge?: JoinAck) => {
    try {
      const conversation = await findConversation(identity, payload.conversationId);
      if (!conversation) {
        if (identity.role === "visitor") {
          acknowledge?.({ ok: true, data: { conversationId: null, status: null, messages: [] } });
          return;
        }
        acknowledge?.({ ok: false, error: "Conversation not found" });
        return;
      }

      await socket.join(roomFor(conversation.id));
      const messages = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: "asc" },
        take: 200,
      });
      acknowledge?.({
        ok: true,
        data: {
          conversationId: conversation.id,
          status: conversation.status,
          messages: messages.map(serializeMessage),
        },
      });
      await markAsRead(identity, conversation.id);
    } catch (error) {
      console.error("Unable to join conversation", error);
      acknowledge?.({ ok: false, error: "Unable to load conversation" });
    }
  });

  socket.on("message:send", async (payload: SendPayload = {}, acknowledge?: SendAck) => {
    const text = normalizeMessage(payload.text);
    if (!text) {
      acknowledge?.({ ok: false, error: "Message must contain 1-2000 characters" });
      return;
    }

    try {
      const conversation = await findConversation(identity, payload.conversationId, true);
      if (!conversation) {
        acknowledge?.({ ok: false, error: "Conversation not found" });
        return;
      }
      if (identity.role === "admin" && conversation.status === "CLOSED") {
        acknowledge?.({ ok: false, error: "Conversation is closed" });
        return;
      }

      const sender = identity.role === "admin" ? MessageSender.OPERATOR : MessageSender.VISITOR;
      const [, created] = await prisma.$transaction([
        prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageAt: new Date(),
            ...(identity.role === "visitor" ? { status: "OPEN" as const } : {}),
          },
        }),
        prisma.message.create({
          data: { conversationId: conversation.id, sender, text },
        }),
      ]);

      const event: SocketMessageEvent = {
        conversationId: conversation.id,
        message: serializeMessage(created),
      };
      await socket.join(roomFor(conversation.id));
      io.to(roomFor(conversation.id)).to("admins").emit("message:created", event);
      acknowledge?.({ ok: true, data: event });
      if (identity.role === "visitor") void notifyAdmins(conversation.id);
    } catch (error) {
      console.error("Unable to send message", error);
      acknowledge?.({ ok: false, error: "Unable to send message" });
    }
  });

  socket.on("conversation:read", async (payload: JoinPayload = {}) => {
    try {
      const conversation = await findConversation(identity, payload.conversationId);
      if (conversation) await markAsRead(identity, conversation.id);
    } catch (error) {
      console.error("Unable to mark messages as read", error);
    }
  });

  socket.on("message:delete", async (payload: MessageActionPayload = {}, acknowledge?: DeleteAck) => {
    if (identity.role !== "admin") {
      acknowledge?.({ ok: false, error: "Forbidden" });
      return;
    }
    if (!payload.conversationId || !payload.messageId) {
      acknowledge?.({ ok: false, error: "Invalid message" });
      return;
    }

    try {
      const message = await prisma.message.findFirst({
        where: { id: payload.messageId, conversationId: payload.conversationId },
        select: { id: true },
      });
      if (!message) {
        acknowledge?.({ ok: false, error: "Message not found" });
        return;
      }

      await prisma.message.delete({ where: { id: message.id } });
      const latest = await prisma.message.findFirst({
        where: { conversationId: payload.conversationId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });
      await prisma.conversation.update({
        where: { id: payload.conversationId },
        data: { lastMessageAt: latest?.createdAt ?? new Date() },
      });

      const event: SocketMessageDeletedEvent = {
        conversationId: payload.conversationId,
        messageId: payload.messageId,
      };
      io.to(roomFor(payload.conversationId)).to("admins").emit("message:deleted", event);
      acknowledge?.({ ok: true, data: event });
    } catch (error) {
      console.error("Unable to delete message", error);
      acknowledge?.({ ok: false, error: "Unable to delete message" });
    }
  });
});

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Chat socket server is listening on port ${port}`);
});

async function shutdown() {
  io.close();
  await prisma.$disconnect();
  httpServer.close(() => process.exit(0));
}

process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
