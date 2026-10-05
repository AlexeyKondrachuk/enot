import styles from "@/app/page.module.scss";
import { siteConfig } from "@/config";
import ChatWidget from "./ChatWidget";

type ContactContent = {
  eyebrow: string;
  title: string;
  description: readonly [string, string];
  telegramAction: string;
  githubAction: string;
};

const defaultContent: ContactContent = {
  eyebrow: "СВЯЗАТЬСЯ",
  title: "Обсудим вашу задачу.",
  description: ["Расскажите, что хотите создать.", "Начнём с задачи и определим следующий шаг."],
  telegramAction: "Написать в Telegram",
  githubAction: "Открыть GitHub",
};

export default function Contact({ content = defaultContent }: { content?: ContactContent }) {
  return (
    <section className={`${styles.section} ${styles.contact}`} id="contact">
      <div className={styles.contactCopy}>
        <p className={styles.eyebrow}>{content.eyebrow}</p>
        <h2>{content.title}</h2>
        <p>
          {content.description[0]}
          <br />
          {content.description[1]}
        </p>
        <div className={styles.contactDetails}>
          <a href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}>
            {siteConfig.phone}
          </a>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
        </div>
        <div className={styles.actions}>
          <a
            className={styles.primaryButton}
            href={siteConfig.telegram}
            target="_blank"
            rel="noreferrer"
          >
            ➤ &nbsp;{content.telegramAction} <span aria-hidden="true">→</span>
          </a>
          <a
            className={styles.secondaryButton}
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
          >
            ◉ &nbsp;{content.githubAction}
          </a>
        </div>
      </div>
      <ChatWidget />
    </section>
  );
}
