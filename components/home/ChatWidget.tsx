"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import styles from "@/app/page.module.scss";
import type { ChatMessage } from "@/Redux/chatApi";
import { useGetMessagesQuery, useSendMessageMutation } from "@/hooks/useChat";
import { useVisitorChatSocket } from "@/hooks/useVisitorChatSocket";
import { useAudioUnlock } from "@/hooks/useAudioUnlock";
import {
  isSoundEnabled,
  playErrorSound,
  playReceiveSound,
  playSendSound,
  setSoundEnabled,
  unlockAudio,
} from "@/lib/chat-sounds";

const quickReplies = ["Нужен сайт", "Интернет-магазин", "Веб-приложение"];
const greeting: ChatMessage = {
  id: "greeting",
  conversationId: "local",
  sender: "OPERATOR",
  text: "Здравствуйте! Расскажите, какую задачу хотите решить?",
  createdAt: "2000-01-01T00:00:00.000Z",
  readAt: null,
};

function messageTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ChatWidget() {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const seenIdsRef = useRef<Set<string> | null>(null); // ← дедупликация для звука

  useAudioUnlock(); // разблокировка аудио первым жестом

  const {
    connected,
    socketError,
    send: sendSocketMessage,
  } = useVisitorChatSocket();
  const { data, isFetching, isError } = useGetMessagesQuery(undefined, {
    pollingInterval: 3000,
    skipPollingIfUnfocused: true,
  });
  const [sendMessage, { isLoading: isSending, error }] =
    useSendMessageMutation();
  const isBusy = isSending || isSubmitting;
  const messages = data?.messages.length ? data.messages : [greeting];

  // ── ЗВУК: восстановить настройку из localStorage ──
  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  // ── ЗВУК: диффим реальные сообщения (data?.messages, не greeting).
  // Пищим только на новые сообщения от OPERATOR ──
  useEffect(() => {
    const incoming = data?.messages;
    if (!incoming?.length) return;
    const seen = seenIdsRef.current;
    if (!seen) {
      // первая загрузка — помечаем всё увиденным, без звука
      seenIdsRef.current = new Set(incoming.map((m) => m.id));
      return;
    }
    const hasIncoming = incoming.some(
      (m) => m.sender === "OPERATOR" && !seen.has(m.id),
    );
    incoming.forEach((m) => seen.add(m.id));
    if (hasIncoming) playReceiveSound();
  }, [data]);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) {
      unlockAudio();
      playSendSound(); // подтверждение, что звук работает
    }
  };

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    const message = text.trim();
    if (!message || isBusy) return;
    setSubmissionError(null);
    setIsSubmitting(true);
    try {
      if (connected) await sendSocketMessage(message);
      else await sendMessage(message).unwrap();
      playSendSound();
      setText("");
    } catch {
      playErrorSound();
      setSubmissionError("Не удалось отправить сообщение. Попробуйте ещё раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <div className={styles.chatWidget} aria-label="Чат с разработчиком">
      <div className={styles.chatTopbar}>
        <div className={styles.chatAvatar}>
          <span>Е</span>
          <i />
        </div>
        <div className={styles.chatPerson}>
          <b>Енот</b>
          <span>
            {connected
              ? "На связи"
              : isError || socketError
                ? "Подключение недоступно"
                : isFetching
                  ? "Обновляем сообщения…"
                  : "Подключаемся…"}
          </span>
        </div>
        <button
          type="button"
          className={styles.chatSoundToggle}
          onClick={toggleSound}
          aria-label={soundOn ? "Выключить звуки чата" : "Включить звуки чата"}
          title={soundOn ? "Звуки включены" : "Звуки выключены"}
        >
          {soundOn ? "🔔" : "🔕"}
        </button>
        <div className={styles.windowDots} aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </div>

      <div className={styles.messageList} ref={listRef} aria-live="polite">
        <p className={styles.chatDate}>Сегодня</p>
        {messages.map((message) => (
          <div
            className={`${styles.messageRow} ${message.sender === "VISITOR" ? styles.messageRowOwn : ""}`}
            key={message.id}
          >
            <div
              className={`${styles.messageBubble} ${message.sender === "VISITOR" ? styles.messageBubbleOwn : ""}`}
            >
              <p>{message.text}</p>
              <time dateTime={message.createdAt}>
                {message.id === "greeting"
                  ? "сейчас"
                  : messageTime(message.createdAt)}
                {message.sender === "VISITOR" && (
                  <> · {message.readAt ? "прочитано" : "доставлено"}</>
                )}
              </time>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.quickReplies}>
        {quickReplies.map((item) => (
          <button type="button" key={item} onClick={() => setText(item)}>
            {item}
          </button>
        ))}
      </div>

      <form className={styles.chatComposer} onSubmit={submit}>
        <div className={styles.chatInputWrap}>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={onKeyDown}
            maxLength={2000}
            rows={1}
            placeholder="Сообщение…"
            aria-label="Сообщение"
          />
          <button
            type="submit"
            disabled={!text.trim() || isBusy}
            aria-label="Отправить сообщение"
          >
            {isBusy ? (
              <span className={styles.chatSpinner} />
            ) : (
              <span aria-hidden="true">↑</span>
            )}
          </button>
        </div>
        {(error || submissionError) && (
          <p className={styles.chatError}>
            {submissionError ??
              "Не удалось отправить. Проверьте подключение и попробуйте снова."}
          </p>
        )}
        <small>Enter — отправить · Shift + Enter — новая строка</small>
      </form>
    </div>
  );
}