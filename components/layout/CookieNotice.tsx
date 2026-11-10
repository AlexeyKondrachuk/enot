"use client";

import { useState, useSyncExternalStore } from "react";
import styles from "./CookieNotice.module.scss";

const storageKey = "enot:cookie-notice:v1";
const changeEvent = "enot:cookie-notice-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(changeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(changeEvent, onChange);
  };
}

function isAcknowledged() {
  try {
    return localStorage.getItem(storageKey) === "acknowledged";
  } catch {
    return false;
  }
}

export default function CookieNotice() {
  const acknowledged = useSyncExternalStore(subscribe, isAcknowledged, () => true);
  const [dismissed, setDismissed] = useState(false);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(storageKey, "acknowledged");
      window.dispatchEvent(new Event(changeEvent));
    } catch {
      // Keep the notice dismissible when browser storage is unavailable.
    }
  }

  if (acknowledged || dismissed) return null;

  return (
    <section className={styles.notice} aria-label="Использование cookie">
      <div>
        <h2>Мы используем cookie</h2>
        <p>
          Cookie помогают сайту работать корректно. Мы также используем
          Яндекс Метрику для анализа посещаемости и улучшения сайта.
          Вы можете ограничить использование cookie в настройках браузера.
        </p>
      </div>
      <button type="button" onClick={dismiss}>Понятно</button>
    </section>
  );
}
