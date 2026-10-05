"use client";

import { useEffect, useState } from "react";
import styles from "@/app/admin/admin.module.scss";
import {
  isSoundEnabled,
  playSendSound,
  setSoundEnabled,
  unlockAudio,
} from "@/lib/chat-sounds";

export default function SoundToggleButton() {
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  const toggle = () => {
    const next = !soundOn;
    setSoundEnabled(next); // localStorage: "on" | "off"
    setSoundOn(next);
    if (next) {
      unlockAudio();
      playSendSound(); // мгновенное подтверждение, что звук работает
    }
  };

  return (
    <button
      type="button"
      className={styles.soundToggleButton}
      onClick={toggle}
      aria-label={soundOn ? "Выключить звуки чата" : "Включить звуки чата"}
      title={soundOn ? "Звуки включены" : "Звуки выключены"}
    >
      {soundOn ? "🔔" : "🔕"}
    </button>
  );
}