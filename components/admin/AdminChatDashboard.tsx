"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/admin/admin.module.scss";
import {
  useGetAdminConversationsQuery,
  useGetAdminMessagesQuery,
  useDeleteAdminMessageMutation,
  useSendAdminMessageMutation,
  useSetConversationStatusMutation,
} from "@/hooks/useAdminChat";
import { useAdminChatSocket } from "@/hooks/useAdminChatSocket";
import { useAudioUnlock } from "@/hooks/useAudioUnlock";
import {
  playErrorSound,
  playReceiveSound,
  playSendSound,
  shouldPlayFor,
} from "@/lib/chat-sounds";
import { bumpUnreadFor, initUnreadReset } from "@/lib/unread-badge";
import PushNotificationButton from "./PushNotificationButton";
import SoundToggleButton from "./SoundToggleButton";

function shortTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export default function AdminChatDashboard() {
  const router = useRouter();
  useAudioUnlock();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [unreadIds, setUnreadIds] = useState<Set<string>>(() => new Set());
  const messageListRef = useRef<HTMLDivElement>(null);

  // «Увиденное» в активном диалоге + штамп, какому activeId он принадлежит
  const seenForRef = useRef<string | null>(null);
  const seenMsgRef = useRef<Set<string>>(new Set());
  // Последнее сообщение по каждому диалогу — для диффа фоновых
  const seenConvRef = useRef<Map<string, string> | null>(null);

  const { data: conversations = [], isError } = useGetAdminConversationsQuery(
    undefined,
    { pollingInterval: 5000 },
  );
  const activeId = selectedId ?? conversations[0]?.id ?? null;
  const {
    connected,
    send: sendSocketMessage,
    remove: removeSocketMessage,
  } = useAdminChatSocket(activeId);
  const { data: messages = [] } = useGetAdminMessagesQuery(activeId ?? "", {
    skip: !activeId,
    pollingInterval: connected ? 0 : 3000,
  });
  const [sendReply, { isLoading: sending }] = useSendAdminMessageMutation();
  const [deleteMessage] = useDeleteAdminMessageMutation();
  const [setStatus, { isLoading: statusLoading }] =
    useSetConversationStatusMutation();
  const selected = useMemo(
    () => conversations.find((item) => item.id === activeId) ?? null,
    [conversations, activeId],
  );

  // ── Бейдж: сброс, когда админ вернулся во вкладку ──
  useEffect(() => initUnreadReset(), []);

  // ── Звук/бейдж: входящие в АКТИВНЫЙ диалог ──
  useEffect(() => {
    if (!activeId || messages.length === 0) return;

    // Диалог сменился (в т.ч. на кэшированный) — история без звука
    if (seenForRef.current !== activeId) {
      seenForRef.current = activeId;
      seenMsgRef.current = new Set(messages.map((m) => m.id));
      setUnreadIds((prev) => {
        const next = new Set(prev);
        next.delete(activeId);
        return next;
      });
      return;
    }

    const seen = seenMsgRef.current;
    const fresh = messages.filter(
      (m) => m.sender === "VISITOR" && !seen.has(m.id),
    );
    messages.forEach((m) => seen.add(m.id));

    const latest = fresh[fresh.length - 1];
    if (latest && shouldPlayFor(latest.id)) {
      playReceiveSound();
      // вкладка скрыта + активный диалог — тоже поднимаем бейдж
      if (document.visibilityState === "hidden") bumpUnreadFor(latest.id);
    }
  }, [messages, activeId]);

  // ── Звук/бейдж/точка: входящие в ФОНОВЫЕ диалоги ──
  useEffect(() => {
    if (conversations.length === 0) return;
    const snapshot = () =>
      new Map(conversations.map((c) => [c.id, c.messages[0]?.id ?? ""]));
    const seen = seenConvRef.current;
    if (!seen) {
      seenConvRef.current = snapshot();
      return;
    }

    const freshConvs = conversations.filter(
      (c) =>
        c.id !== activeId &&
        c.messages[0]?.sender === "VISITOR" &&
        c.messages[0]?.id !== seen.get(c.id),
    );
    seenConvRef.current = snapshot();
    if (freshConvs.length === 0) return;

    const newUnread: string[] = [];
    for (const conv of freshConvs) {
      const msgId = conv.messages[0]!.id;
      // дедуп по id: звук и бейдж сработают один раз,
      // даже если то же сообщение уже отработал сокет-обработчик
      if (shouldPlayFor(msgId)) playReceiveSound();
      bumpUnreadFor(msgId);
      newUnread.push(conv.id);
    }
    setUnreadIds((prev) => {
      const next = new Set(prev);
      newUnread.forEach((id) => next.add(id));
      return next;
    });
  }, [conversations, activeId]);

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  const selectConversation = (id: string) => {
    setSelectedId(id);
    setUnreadIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const message = text.trim();
    if (!activeId || !message || sending) return;
    setActionError(null);
    try {
      if (connected) await sendSocketMessage(message, activeId);
      else await sendReply({ conversationId: activeId, text: message }).unwrap();
      playSendSound();
      setText("");
    } catch {
      playErrorSound();
      setActionError(
        "Не удалось отправить сообщение. Проверьте подключение и попробуйте снова.",
      );
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  const removeMessage = async (messageId: string) => {
    if (
      !activeId ||
      !window.confirm("Удалить это сообщение без возможности восстановления?")
    )
      return;
    setActionError(null);
    setDeletingId(messageId);
    try {
      if (connected) await removeSocketMessage(messageId, activeId);
      else
        await deleteMessage({ conversationId: activeId, messageId }).unwrap();
    } catch {
      playErrorSound();
      setActionError(
        "Не удалось удалить сообщение. Проверьте подключение и попробуйте снова.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (isError)
    return (
      <main className={styles.adminError}>
        <div>
          <h1>Сессия завершена</h1>
          <p>Войдите повторно, чтобы открыть переписки.</p>
          <button onClick={() => router.replace("/admin/login")}>
            Перейти ко входу
          </button>
        </div>
      </main>
    );

  return (
    <main className={styles.adminShell}>
      <aside className={styles.adminSidebar}>
        <header className={styles.adminBrand}>
          <div>Е</div>
          <p>
            <b>Енот</b>
            <span>Центр сообщений</span>
          </p>
        </header>
        <div className={styles.inboxTitle}>
          <h1>Диалоги</h1>
          <span>
            {conversations.filter((item) => item.status === "OPEN").length}
          </span>
        </div>
        <div className={styles.conversationList}>
          {conversations.length === 0 && (
            <div className={styles.emptyList}>
              <b>Пока тихо</b>
              <span>Новые обращения появятся здесь</span>
            </div>
          )}
          {conversations.map((conversation) => {
            const last = conversation.messages[0];
            return (
              <button
                className={
                  conversation.id === activeId ? styles.conversationActive : ""
                }
                onClick={() => selectConversation(conversation.id)}
                key={conversation.id}
              >
                <span className={styles.visitorAvatar}>
                  {conversation.id.slice(-2).toUpperCase()}
                </span>
                <span className={styles.conversationCopy}>
                  <b>Посетитель {conversation.id.slice(-5)}</b>
                  <small>{last?.text ?? "Новый диалог"}</small>
                </span>
                <span className={styles.conversationMeta}>
                  <time>{shortDate(conversation.lastMessageAt)}</time>
                  {unreadIds.has(conversation.id) && (
                    <i className={styles.unreadDot} aria-hidden="true" />
                  )}
                  <i
                    className={
                      conversation.status === "OPEN"
                        ? styles.statusOpen
                        : styles.statusClosed
                    }
                  />
                </span>
              </button>
            );
          })}
        </div>
        <div className={styles.sidebarActions}>
          <SoundToggleButton />
          <PushNotificationButton />
          <button className={styles.logoutButton} onClick={logout}>
            <span>↗</span> Выйти
          </button>
        </div>
      </aside>

      <section className={styles.adminDialog}>
        {selected ? (
          <>
            <header className={styles.dialogHeader}>
              <div className={styles.visitorAvatar}>
                {selected.id.slice(-2).toUpperCase()}
              </div>
              <div>
                <b>Посетитель {selected.id.slice(-5)}</b>
                <span>
                  {selected.status === "OPEN"
                    ? "Активный диалог"
                    : "Диалог закрыт"}
                </span>
              </div>
              <button
                disabled={statusLoading}
                onClick={() =>
                  setStatus({
                    conversationId: selected.id,
                    status: selected.status === "OPEN" ? "CLOSED" : "OPEN",
                  })
                }
              >
                {selected.status === "OPEN" ? "Закрыть" : "Открыть снова"}
              </button>
            </header>
            <div className={styles.adminMessages} ref={messageListRef}>
              <p className={styles.adminDate}>История переписки</p>
              {messages.map((message) => (
                <div
                  className={`${styles.adminMessageRow} ${message.sender === "OPERATOR" ? styles.adminMessageOwn : ""}`}
                  key={message.id}
                >
                  <div>
                    <p>{message.text}</p>
                    <div className={styles.adminMessageMeta}>
                      <time>
                        {shortTime(message.createdAt)}
                        {message.sender === "OPERATOR" && (
                          <> · {message.readAt ? "прочитано" : "доставлено"}</>
                        )}
                      </time>
                      <button
                        type="button"
                        disabled={deletingId === message.id}
                        onClick={() => void removeMessage(message.id)}
                        aria-label="Удалить сообщение"
                      >
                        {deletingId === message.id ? "…" : "Удалить"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <form className={styles.adminComposer} onSubmit={submit}>
              <textarea
                rows={1}
                maxLength={2000}
                placeholder="Напишите ответ…"
                value={text}
                onChange={(event) => setText(event.target.value)}
                disabled={selected.status === "CLOSED"}
              />
              <button
                disabled={
                  !text.trim() || sending || selected.status === "CLOSED"
                }
              >
                {sending ? "…" : "↑"}
              </button>
              {actionError && (
                <p className={styles.adminActionError}>{actionError}</p>
              )}
            </form>
          </>
        ) : (
          <div className={styles.noDialog}>
            <div>✦</div>
            <h2>Выберите диалог</h2>
            <p>Переписка откроется в этом окне</p>
          </div>
        )}
      </section>
    </main>
  );
}