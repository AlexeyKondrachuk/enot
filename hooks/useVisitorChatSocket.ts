"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { chatApi } from "@/Redux/chatApi";
import { useAppDispatch } from "@/hooks/Redux";
import type {
  SocketAck,
  SocketHistory,
  SocketMessageDeletedEvent,
  SocketMessageEvent,
  SocketMessagesReadEvent,
} from "@/lib/chat-socket-types";

type TokenResponse = { token: string; socketUrl: string };

async function getSocketToken() {
  const response = await fetch("/api/chat/socket-token", { method: "POST" });
  if (!response.ok) throw new Error("Unable to authorize chat connection");
  return response.json() as Promise<TokenResponse>;
}

export function useVisitorChatSocket() {
  const dispatch = useAppDispatch();
  const socketRef = useRef<Socket | null>(null);
  const refreshingRef = useRef(false);
  const [connected, setConnected] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);

  const addMessageToCache = useCallback((event: SocketMessageEvent) => {
    dispatch(chatApi.util.updateQueryData("getMessages", undefined, (draft) => {
      if (!draft.messages.some((message) => message.id === event.message.id)) draft.messages.push(event.message);
      draft.conversationId = event.conversationId;
      draft.status = "OPEN";
    }));
  }, [dispatch]);

  useEffect(() => {
    let disposed = false;

    const connect = async () => {
      try {
        const { token, socketUrl } = await getSocketToken();
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
          socket.emit("conversation:join", {}, (response: SocketAck<SocketHistory>) => {
            if (!response.ok) return setSocketError(response.error);
            dispatch(chatApi.util.updateQueryData("getMessages", undefined, (draft) => {
              draft.conversationId = response.data.conversationId;
              draft.status = response.data.status;
              draft.messages = response.data.messages;
            }));
          });
        });
        socket.on("disconnect", () => setConnected(false));
        socket.on("message:created", addMessageToCache);
        socket.on("message:created", (event: SocketMessageEvent) => {
          if (event.message.sender === "OPERATOR") {
            socket.emit("conversation:read", { conversationId: event.conversationId });
          }
        });
        socket.on("messages:read", (event: SocketMessagesReadEvent) => {
          const messageIds = new Set(event.messageIds);
          dispatch(chatApi.util.updateQueryData("getMessages", undefined, (draft) => {
            for (const message of draft.messages) {
              if (messageIds.has(message.id)) message.readAt = event.readAt;
            }
          }));
        });
        socket.on("message:deleted", (event: SocketMessageDeletedEvent) => {
          dispatch(chatApi.util.updateQueryData("getMessages", undefined, (draft) => {
            draft.messages = draft.messages.filter((message) => message.id !== event.messageId);
          }));
        });
        socket.on("connect_error", async (error) => {
          setConnected(false);
          setSocketError(error.message);
          if (error.message !== "Unauthorized" || refreshingRef.current) return;
          refreshingRef.current = true;
          try {
            const refreshed = await getSocketToken();
            socket.auth = { token: refreshed.token };
            socket.connect();
          } finally {
            refreshingRef.current = false;
          }
        });
      } catch (error) {
        setSocketError(error instanceof Error ? error.message : "Chat connection failed");
      }
    };

    void connect();
    return () => {
      disposed = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [addMessageToCache, dispatch]);

  const send = useCallback((text: string) => new Promise<void>((resolve, reject) => {
    const socket = socketRef.current;
    if (!socket?.connected) return reject(new Error("Socket is disconnected"));
    socket.timeout(8000).emit("message:send", { text }, (timeoutError: Error | null, response: SocketAck<SocketMessageEvent>) => {
      if (timeoutError) return reject(timeoutError);
      if (!response.ok) return reject(new Error(response.error));
      addMessageToCache(response.data);
      resolve();
    });
  }), [addMessageToCache]);

  return { connected, socketError, send };
}
