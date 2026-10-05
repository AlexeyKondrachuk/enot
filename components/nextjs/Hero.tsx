import Image from "next/image";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { siteConfig } from "@/config";
import styles from "@/app/nextjs/page.module.scss";

export default function NextjsHero() {
  return (
    <section className={styles.hero} aria-labelledby="nextjs-title" id="top">
      <div className={styles.heroArtwork}>
        <Image
          src="/nextjs/hero-next.webp"
          alt="Стеклянная буква N, серверные компоненты и оптимизация Next.js"
          width={1200}
          height={600}
          sizes="(max-width: 760px) 100vw, (max-width: 1440px) 85vw, 1200px"
          preload
        />
      </div>
      <div className={`${styles.container} ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <Breadcrumbs title="Разработка на Next.js" path="/nextjs" />
          <p className={styles.eyebrow}>NEXT.JS</p>
          <h1 id="nextjs-title">Современная основа<br />для быстрых<br /><span>веб-продуктов.</span></h1>
          <p className={styles.heroLead}>Next.js — фреймворк на React для создания современных сайтов и веб-приложений: высокая производительность, инструменты SEO и удобная разработка.</p>
          <div className={styles.actions}>
            <a className={styles.primaryButton} href="#contact">Обсудить задачу <span aria-hidden="true">→</span></a>
            <a className={styles.secondaryButton} href={siteConfig.telegram} target="_blank" rel="noreferrer">Написать в Telegram <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}
