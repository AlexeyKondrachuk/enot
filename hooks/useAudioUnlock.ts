"use client";

import { useEffect } from "react";
import { unlockAudio } from "@/lib/chat-sounds";

/** Браузеры запрещают звук до первого жеста — снимаем блокировку один раз. */
export function useAudioUnlock() {
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);
}