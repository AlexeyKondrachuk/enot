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
  useUpdateConversationMutation,
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
import type { ChatMessage } from "@/Redux/chatApi";

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
  const [archived, setArchived] = useState(false);
  const [limit, setLimit] = useState(50);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [olderByChat, setOlderByChat] = useState<Record<string, ChatMessage[]>>({});
  const [historyComplete, setHistoryComplete] = useState<Set<string>>(() => new Set());
  const [loadingOlder, setLoadingOlder] = useState(false);
  const prependScrollRef = useRef<{ id: string; height: number; top: number } | null>(null);
  const [text, setText] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [unreadIds, setUnreadIds] = useState<Set<string>>(() => new Set());
  const messageListRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const scrolledConversationRef = useRef<string | null>(null);

  // «Увиденное» в активном диалоге + штамп, какому activeId он принадлежит
  const seenForRef = useRef<string | null>(null);
  const seenMsgRef = useRef<Set<string>>(new Set());
  // Последнее сообщение по каждому диалогу — для диффа фоновых
  const seenConvRef = useRef<Map<string, string> | null>(null);

  const { currentData, data: previousPage, isError, isFetching } = useGetAdminConversationsQuery(
    { archived, limit },
    { pollingInterval: 5000 },
  );
  const conversationPage = currentData ?? (previousPage?.items.every((item) => item.archived === archived) ? previousPage : undefined);
  const conversations = useMemo(() => conversationPage?.items ?? [], [conversationPage]);
  const activeId = conversations.some((item) => item.id === selectedId)
    ? selectedId : conversations[0]?.id ?? null;
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
  const displayedMessages = useMemo(() => {
    const unique = new Map<string, ChatMessage>();
    for (const message of [...(olderByChat[activeId ?? ""] ?? []), ...messages]) unique.set(message.id, message);
    return [...unique.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  }, [olderByChat, messages, activeId]);
  const [deleteMessage] = useDeleteAdminMessageMutation();
  const [updateConversation, { isLoading: updating }] = useUpdateConversationMutation();
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
    const pending = prependScrollRef.current;
    const element = messageListRef.current;
    if (pending?.id === activeId && element) {
      element.scrollTop = pending.top + element.scrollHeight - pending.height;
      prependScrollRef.current = null;
      return;
    }
    const changedConversation = scrolledConversationRef.current !== activeId;
    scrolledConversationRef.current = activeId;
    if (!changedConversation && !nearBottomRef.current) return;
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: changedConversation ? "instant" : "smooth",
    });
    nearBottomRef.current = true;
  }, [displayedMessages, activeId]);

  const selectConversation = (id: string) => {
    setEditingName(null);
    setActionError(null);
    setSelectedId(id);
    setUnreadIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const changeFolder = (nextArchived: boolean) => {
    setArchived(nextArchived);
    setLimit(50);
    setSelectedId(null);
    setEditingName(null);
    setActionError(null);
    seenConvRef.current = null;
  };

  const saveName = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeId || editingName !== activeId || updating) return;
    setActionError(null);
    try {
      await updateConversation({ conversationId: activeId, name }).unwrap();
      setEditingName(null);
    } catch { setActionError("Не удалось сохранить имя чата."); }
  };

  const toggleArchive = async () => {
    if (!selected || updating) return;
    setActionError(null);
    try {
      await updateConversation({ conversationId: selected.id, archived: !selected.archived }).unwrap();
      setSelectedId(null);
      setEditingName(null);
    } catch { setActionError("Не удалось переместить чат. Попробуйте снова."); }
  };

  const loadOlder = async () => {
    if (!activeId || !displayedMessages.length || loadingOlder) return;
    const id = activeId;
    setLoadingOlder(true);
    setActionError(null);
    try {
      const response = await fetch(`/api/chat/admin/conversations/${id}/messages?before=${encodeURIComponent(displayedMessages[0].id)}`);
      if (!response.ok) throw new Error("Unable to load history");
      const older = await response.json() as ChatMessage[];
      const element = messageListRef.current;
      if (element) prependScrollRef.current = { id, height: element.scrollHeight, top: element.scrollTop };
      setOlderByChat((prev) => ({ ...prev, [id]: [...older, ...(prev[id] ?? [])] }));
      if (older.length < 200) setHistoryComplete((prev) => new Set([...prev, id]));
    } catch { setActionError("Не удалось загрузить историю переписки."); }
    finally { setLoadingOlder(false); }
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
      setOlderByChat((prev) => ({ ...prev, [activeId]: (prev[activeId] ?? []).filter((message) => message.id !== messageId) }));
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
        <div className={styles.folderTabs} aria-label="Разделы диалогов">
          <button type="button" aria-pressed={!archived} onClick={() => changeFolder(false)}>Чаты</button>
          <button type="button" aria-pressed={archived} onClick={() => changeFolder(true)}>Архив</button>
        </div>
        <div className={styles.conversationList}>
          {conversations.length === 0 && (
            <div className={styles.emptyList}>
              <b>{isFetching ? "Загрузка…" : archived ? "Архив пуст" : "Пока тихо"}</b>
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
                title={conversation.name || `Посетитель ${conversation.id.slice(-5)}`}
              >
                <span className={styles.visitorAvatar}>
                  {conversation.id.slice(-2).toUpperCase()}
                </span>
                <span className={styles.conversationCopy}>
                  <b>{conversation.name || `Посетитель ${conversation.id.slice(-5)}`}</b>
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
          {conversationPage?.hasMore && (
            <button type="button" disabled={isFetching} onClick={() => setLimit((value) => value + 50)}>
              {isFetching ? "Загрузка…" : "Загрузить ещё"}
            </button>
          )}
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
                <b title={selected.name || undefined}>{selected.name || `Посетитель ${selected.id.slice(-5)}`}</b>
                <span>
                  {selected.archived ? "В архиве" : selected.status === "OPEN"
                    ? "Активный диалог"
                    : "Диалог закрыт"}
                </span>
              </div>
              <div className={styles.dialogActions}>
              <button type="button" onClick={() => { setName(selected.name ?? ""); setEditingName(selected.id); }}>
                Имя чата
              </button>
              <button type="button" disabled={updating} onClick={() => void toggleArchive()}>
                {selected.archived ? "Вернуть" : "В архив"}
              </button>
              <button
                disabled={statusLoading}
                onClick={async () => {
                  setActionError(null);
                  try { await setStatus({
                    conversationId: selected.id,
                    status: selected.status === "OPEN" ? "CLOSED" : "OPEN",
                  }).unwrap(); } catch { setActionError("Не удалось изменить статус чата."); }
                }}
              >
                {selected.status === "OPEN" ? "Закрыть" : "Открыть снова"}
              </button>
              </div>
              {editingName === selected.id && (
                <form className={styles.nameEditor} onSubmit={saveName}>
                  <label htmlFor="chat-name">Имя чата (видно только администратору)</label>
                  <input id="chat-name" value={name} maxLength={80} onChange={(event) => setName(event.target.value)} placeholder="Например, Иван — интернет-магазин" autoFocus />
                  <small>Пустое имя вернёт название «Посетитель».</small>
                  <div><button disabled={updating}>Сохранить</button><button type="button" onClick={() => setEditingName(null)}>Отмена</button></div>
                </form>
              )}
            </header>
            <div className={styles.adminMessages} ref={messageListRef} onScroll={(event) => {
              const element = event.currentTarget;
              nearBottomRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
            }}>
              <p className={styles.adminDate}>История переписки</p>
              {activeId && messages.length >= 200 && !historyComplete.has(activeId) && (
                <button className={styles.loadHistory} type="button" disabled={loadingOlder} onClick={() => void loadOlder()}>
                  {loadingOlder ? "Загрузка…" : "Загрузить предыдущие сообщения"}
                </button>
              )}
              {displayedMessages.map((message) => (
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
