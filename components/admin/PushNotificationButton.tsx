"use client";

import styles from "@/app/admin/admin.module.scss";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const labels = {
  loading: "Проверяем уведомления…",
  unsupported: "Уведомления не поддерживаются",
  blocked: "Уведомления заблокированы",
  disabled: "Включить уведомления",
  enabled: "Уведомления включены",
  error: "Не удалось включить уведомления",
} as const;

export default function PushNotificationButton() {
  const { state, busy, detail, enable, disable } = usePushNotifications();
  const canEnable = state === "disabled" || state === "error";
  const canDisable = state === "enabled";

  const explanation = detail ?? (state === "blocked" ? "Разрешите уведомления в настройках сайта Chrome" : null);

  return <div className={styles.pushControl}>
    <button
      type="button"
      className={`${styles.pushButton} ${state === "enabled" ? styles.pushButtonActive : ""}`}
      disabled={busy || (!canEnable && !canDisable)}
      onClick={() => void (canDisable ? disable() : enable())}
      title={explanation ?? undefined}
    >
      <span aria-hidden="true">{state === "enabled" ? "●" : "○"}</span>
      {busy ? "Подождите…" : labels[state]}
    </button>
    {explanation && <small>{explanation}</small>}
  </div>;
}
