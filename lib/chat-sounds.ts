// lib/chat-sounds.ts


type ToneOptions = {
  frequency: number;      // частота, Гц
  duration: number;       // длительность, сек
  delay?: number;         // задержка перед началом, сек
  volume?: number;        // громкость 0..1
  type?: OscillatorType;  // форма волны: sine | square | triangle | sawtooth
};

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null; // SSR-защита

  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null; // очень старый браузер — молча выходим

  if (!audioContext) audioContext = new Ctor();
  return audioContext;
}

/** Снимает блокировку автоплея. Вызывать на первый жест пользователя. */
export function unlockAudio() {
  const context = getContext();
  if (context && context.state === "suspended") {
    void context.resume().catch(() => {
      /* не критично — попробуем при следующем жесте */
    });
  }
}

/* ---------- Переключатель вкл/выкл (хранится в localStorage) ---------- */

const STORAGE_KEY = "chat-sound";

function enabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== "off"; // по умолчанию включено
}

export function isSoundEnabled(): boolean {
  return enabled();
}

export function setSoundEnabled(value: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, value ? "on" : "off");
}

/* ---------- Проигрывание одного тона ---------- */

function playTone({ frequency, duration, delay = 0, volume = 0.12, type = "sine" }: ToneOptions) {
  const context = getContext();
  if (!context || context.state !== "running" || !enabled()) return;

  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);

  // Плавная атака и затухание — без щелчков на границах
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

/* ---------- Готовые звуки ---------- */

/** Двойной «блип» вверх — сообщение отправлено. */
export function playSendSound() {
  playTone({ frequency: 660, duration: 0.09 });
  playTone({ frequency: 990, duration: 0.12, delay: 0.07 });
}

/** «Динь-дон» вниз — входящее сообщение. */
export function playReceiveSound() {
  playTone({ frequency: 987.77, duration: 0.12 });
  playTone({ frequency: 659.25, duration: 0.2, delay: 0.1 });
}

/** Низкий «буп» — ошибка отправки (опционально). */
export function playErrorSound() {
  playTone({ frequency: 220, duration: 0.18, type: "square", volume: 0.06 });
}

let lastSoundId: string | null = null;

export function shouldPlayFor(messageId: string): boolean {
  if (lastSoundId === messageId) return false;
  lastSoundId = messageId;
  return true;
}



