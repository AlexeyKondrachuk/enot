import Link from "next/link";
import styles from "@/app/layout.module.scss";
import { siteConfig } from "@/config";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerMain}>
        <div>
          <Logo />
          <small>Fullstack-разработка на Next.js</small>
        </div>
        <nav aria-label="Навигация в подвале">
          <Link href="/#services">Услуги</Link>
          <Link href="/#projects">Проекты</Link>
          <Link href="/about">Обо мне</Link>
          <Link href="/documents">Документы</Link>
          <a href="#contact">Контакты</a>
        </nav>
        <div className={styles.socials}>
          <a href={siteConfig.telegram} target="_blank" rel="noreferrer">
            ➤ Telegram
          </a>
          <a href={siteConfig.github} target="_blank" rel="noreferrer">
            ◉ GitHub
          </a>
        </div>
      </div>
      <a
        className={styles.hostingPartner}
        href="https://beget.com/p1234567890/vip"
        target="_blank"
        rel="sponsored noopener noreferrer"
      >
        <span className={styles.hostingIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="4" y="3" width="16" height="7" rx="2" />
            <rect x="4" y="14" width="16" height="7" rx="2" />
            <path d="M8 6.5h.01M8 17.5h.01M12 6.5h4M12 17.5h4" />
          </svg>
        </span>
        <span className={styles.hostingCopy}>
          <span className={styles.hostingTitle}>Хостинг для вашего проекта <strong>Beget</strong></span>
          <span className={styles.hostingDisclosure}>Партнёрская ссылка</span>
        </span>
        <span className={styles.hostingArrow} aria-hidden="true">↗</span>
      </a>
      <div className={styles.footerBottom}>
        <span>© 2026 {siteConfig.name}</span>
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
        <a href="#top">Наверх ↑</a>
      </div>
    </footer>
  );
}
