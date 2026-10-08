export type MetrikaGoal = "chat_message_sent" | "telegram_click" | "phone_click" | "email_click";

export function trackMetrikaGoal(goal: MetrikaGoal) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("enot:metrika-goal", { detail: goal }));
}

// Count an enquiry, rather than every message in the same conversation session.
export function trackChatEnquiry() {
  try {
    if (sessionStorage.getItem("enot:chat-enquiry-tracked")) return;
    sessionStorage.setItem("enot:chat-enquiry-tracked", "1");
  } catch {
    // Restricted storage must not prevent sending a message or tracking it.
  }
  trackMetrikaGoal("chat_message_sent");
}
