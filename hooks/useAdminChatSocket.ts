"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { adminChatApi } from "@/Redux/adminChatApi";
import { useAppDispatch } from "@/hooks/Redux";
import type {
  SocketAck,
  SocketHistory,
  SocketMessageDeletedEvent,
  SocketMessageEvent,
  SocketMessagesReadEvent,
} from "@/lib/chat-socket-types";
import { playReceiveSound, shouldPlayFor } from "@/lib/chat-sounds";
import { bumpUnreadFor } from "@/lib/unread-badge";

type TokenResponse = {
  token: string;
  socketUrl: string;
  role: "admin" | "visitor";
};

async function getAdminSocketToken() {
  const response = await fetch("/api/chat/socket-token", { method: "POST" });
  if (!response.ok) throw new Error("Unable to authorize chat connection");
  const body = (await response.json()) as TokenResponse;
  if (body.role !== "admin") throw new Error("Admin session is required");
  return body;
}

export function useAdminChatSocket(conversationId: string | null) {
  const dispatch = useAppDispatch();
  const socketRef = useRef<Socket | null>(null);
  const refreshingRef = useRef(false);
  const activeConversationRef = useRef(conversationId);
  const [connected, setConnected] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);

  useEffect(() => {
    activeConversationRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    let disposed = false;
    const connect = async () => {
      try {
        const { token, socketUrl } = await getAdminSocketToken();
        if (disposed) return;
        const socket = io(socketUrl, {
          auth: { token },
          transports: ["websocket", "polling"],
          reconnection: true,
        });
        socketRef.current = socket;
        socket.on("connect", () => {
          setConnected(true);
          setSocketError(null);
        });
        socket.on("disconnect", () => setConnected(false));
        socket.on("connect_error", async (error) => {
          setConnected(false);
          setSocketError(error.message);
          if (error.message !== "Unauthorized" || refreshingRef.current) return;
          refreshingRef.current = true;
          try {
            const refreshed = await getAdminSocketToken();
            socket.auth = { token: refreshed.token };
            socket.connect();
          } finally {
            refreshingRef.current = false;
          }
        });
     socket.on("message:created", (event: SocketMessageEvent) => {
  // 1. Обновляем кэш сообщений (как было)
  dispatch(
    adminChatApi.util.updateQueryData(
      "getAdminMessages",
      event.conversationId,
      (draft) => {
        if (!draft.some((message) => message.id === event.message.id))
          draft.push(event.message);
      },
    ),
  );
  // 2. Обновляем список диалогов (как было)
  dispatch(adminChatApi.util.invalidateTags(["AdminConversations"]));

  // 3. Реакция на входящее от посетителя
  if (event.message.sender === "VISITOR") {
    const isActive = activeConversationRef.current === event.conversationId;

    // shouldPlayFor дедуплирует: если звук уже сыграл дифф в дашборде,
    // здесь он не повторится (и наоборот) — двойного «динь» не будет
    if (shouldPlayFor(event.message.id)) {
      playReceiveSound();
      // Бейдж: сообщение в фоновом диалоге или вкладка скрыта
      if (!isActive || document.visibilityState === "hidden") {
        bumpUnreadFor(event.message.id);
      }
    }

    if (isActive) {
      socket.emit("conversation:read", {
        conversationId: event.conversationId,
      });
    }
  }
});
        socket.on("messages:read", (event: SocketMessagesReadEvent) => {
          const messageIds = new Set(event.messageIds);
          dispatch(
            adminChatApi.util.updateQueryData(
              "getAdminMessages",
              event.conversationId,
              (draft) => {
                for (const message of draft) {
                  if (messageIds.has(message.id)) message.readAt = event.readAt;
                }
              },
            ),
          );
        });
        socket.on("message:deleted", (event: SocketMessageDeletedEvent) => {
          dispatch(
            adminChatApi.util.updateQueryData(
              "getAdminMessages",
              event.conversationId,
              (draft) => {
                const index = draft.findIndex(
                  (message) => message.id === event.messageId,
                );
                if (index >= 0) draft.splice(index, 1);
              },
            ),
          );
          dispatch(adminChatApi.util.invalidateTags(["AdminConversations"]));
        });
      } catch (error) {
        setSocketError(
          error instanceof Error ? error.message : "Chat connection failed",
        );
      }
    };
    void connect();
    return () => {
      disposed = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [dispatch]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!conversationId || !socket?.connected) return;
    socket.emit(
      "conversation:join",
      { conversationId },
      (response: SocketAck<SocketHistory>) => {
        if (!response.ok) return setSocketError(response.error);
        dispatch(
          adminChatApi.util.updateQueryData(
            "getAdminMessages",
            conversationId,
            (draft) => {
              draft.splice(0, draft.length, ...response.data.messages);
            },
          ),
        );
      },
    );
  }, [connected, conversationId, dispatch]);

  const send = useCallback(
    (text: string, activeConversationId: string) =>
      new Promise<void>((resolve, reject) => {
        const socket = socketRef.current;
        if (!socket?.connected)
          return reject(new Error("Socket is disconnected"));
        socket
          .timeout(8000)
          .emit(
            "message:send",
            { conversationId: activeConversationId, text },
            (
              timeoutError: Error | null,
              response: SocketAck<SocketMessageEvent>,
            ) => {
              if (timeoutError) return reject(timeoutError);
              if (!response.ok) return reject(new Error(response.error));
              resolve();
            },
          );
      }),
    [],
  );

  const remove = useCallback(
    (messageId: string, activeConversationId: string) =>
      new Promise<void>((resolve, reject) => {
        const socket = socketRef.current;
        if (!socket?.connected)
          return reject(new Error("Socket is disconnected"));
        socket
          .timeout(8000)
          .emit(
            "message:delete",
            { conversationId: activeConversationId, messageId },
            (
              timeoutError: Error | null,
              response: SocketAck<SocketMessageDeletedEvent>,
            ) => {
              if (timeoutError) return reject(timeoutError);
              if (!response.ok) return reject(new Error(response.error));
              resolve();
            },
          );
      }),
    [],
  );

  return { connected, socketError, send, remove };
}

