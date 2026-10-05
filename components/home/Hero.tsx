import styles from "@/app/page.module.scss";
import { siteConfig } from "@/config";

export default function Hero() {
  return <section className={styles.hero} id="top">
    <div className={styles.heroGlow}/>
    <div className={`${styles.container} ${styles.heroInner}`}>
      <p className={styles.eyebrow}>FULLSTACK-РАЗРАБОТЧИК · NEXT.JS</p>
      <h1>Сложные задачи.<br/><span>Ясные решения.</span></h1>
      <p className={styles.lead}>{siteConfig.description}</p>
      <div className={styles.actions}>
        <a className={styles.primaryButton} href="#contact">Обсудить задачу <span aria-hidden="true">→</span></a>
        <a className={styles.secondaryButton} href="#projects">Смотреть проекты <span aria-hidden="true">→</span></a>
      </div>
    </div>
  </section>;
}
