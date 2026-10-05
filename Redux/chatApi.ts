import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { SocketChatMessage } from "@/lib/chat-socket-types";

export type ChatMessage = SocketChatMessage;

export type ChatResponse = {
  conversationId: string | null;
  status: "OPEN" | "CLOSED" | null;
  messages: ChatMessage[];
};

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/chat" }),
  tagTypes: ["Messages"],
  endpoints: (builder) => ({
    getMessages: builder.query<ChatResponse, void>({
      query: () => "messages",
      providesTags: ["Messages"],
    }),
    sendMessage: builder.mutation<ChatMessage, string>({
      query: (text) => ({ url: "messages", method: "POST", body: { text } }),
      invalidatesTags: ["Messages"],
    }),
  }),
});

export const { useGetMessagesQuery, useSendMessageMutation } = chatApi;
