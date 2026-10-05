import Link from "next/link";
import styles from "@/app/layout.module.scss";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Logo />
        <nav aria-label="Основная навигация">
          <Link href="/#services">Услуги</Link>
          <Link href="/#projects">Проекты</Link>
          <Link href="/#approach">Подход</Link>
          <Link href="/documents">Документы</Link>
          <Link href="/about">Обо мне</Link>
        </nav>
        <Link className={styles.headerCta} href="#contact">
          Обсудить задачу <span>→</span>
        </Link>
      </div>
    </header>
  );
}
