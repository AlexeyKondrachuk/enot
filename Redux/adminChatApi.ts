import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ChatMessage } from "./chatApi";

export type AdminConversation = {
  id: string;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messages: ChatMessage[];
};

export const adminChatApi = createApi({
  reducerPath: "adminChatApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/chat/admin" }),
  tagTypes: ["AdminConversations", "AdminMessages"],
  endpoints: (builder) => ({
    getAdminConversations: builder.query<AdminConversation[], void>({
      query: () => "conversations",
      providesTags: ["AdminConversations"],
    }),
    getAdminMessages: builder.query<ChatMessage[], string>({
      query: (conversationId) => `conversations/${conversationId}/messages`,
      providesTags: (_result, _error, id) => [{ type: "AdminMessages", id }],
    }),
    sendAdminMessage: builder.mutation<ChatMessage, { conversationId: string; text: string }>({
      query: ({ conversationId, text }) => ({ url: `conversations/${conversationId}/messages`, method: "POST", body: { text } }),
      invalidatesTags: (_result, _error, { conversationId }) => ["AdminConversations", { type: "AdminMessages", id: conversationId }],
    }),
    deleteAdminMessage: builder.mutation<void, { conversationId: string; messageId: string }>({
      query: ({ conversationId, messageId }) => ({
        url: `conversations/${conversationId}/messages/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { conversationId }) => ["AdminConversations", { type: "AdminMessages", id: conversationId }],
    }),
    setConversationStatus: builder.mutation<AdminConversation, { conversationId: string; status: "OPEN" | "CLOSED" }>({
      query: ({ conversationId, status }) => ({ url: `conversations/${conversationId}`, method: "PATCH", body: { status } }),
      invalidatesTags: ["AdminConversations"],
    }),
  }),
});

export const {
  useGetAdminConversationsQuery,
  useGetAdminMessagesQuery,
  useSendAdminMessageMutation,
  useDeleteAdminMessageMutation,
  useSetConversationStatusMutation,
} = adminChatApi;
