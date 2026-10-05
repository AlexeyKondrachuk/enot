export type ChatSender = "VISITOR" | "OPERATOR" | "SYSTEM";
export type ConversationStatus = "OPEN" | "CLOSED";

export type SocketChatMessage = {
  id: string;
  conversationId: string;
  sender: ChatSender;
  text: string;
  createdAt: string;
  readAt: string | null;
};

export type SocketHistory = {
  conversationId: string | null;
  status: ConversationStatus | null;
  messages: SocketChatMessage[];
};

export type SocketAck<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type SocketMessageEvent = {
  conversationId: string;
  message: SocketChatMessage;
};

export type SocketMessagesReadEvent = {
  conversationId: string;
  messageIds: string[];
  readAt: string;
};

export type SocketMessageDeletedEvent = {
  conversationId: string;
  messageId: string;
};
