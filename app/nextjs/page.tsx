import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import { Oswald } from "next/font/google";
import ChatWidget from "@/components/home/ChatWidget";
import NextjsHero from "@/components/nextjs/Hero";
import Performance from "@/components/nextjs/Performance";
import { nextjsData as data } from "@/data/nextjs";
import { siteConfig } from "@/config";
import styles from "./page.module.scss";

const headingFont = Oswald({ subsets: ["latin", "cyrillic"], weight: ["500", "600"], display: "swap", variable: "--nextjs-heading-font" });

export const metadata = pageMetadata("Разработка на Next.js", "Сайты, интернет-магазины и веб-приложения на Next.js. Современная архитектура, производительность, SEO и интеграции под задачи вашего бизнеса.", "/nextjs");

function Icon({ name, size = 40 }: { name: string; size?: number }) {
  return <Image src={`/nextjs/icons/${name}.svg`} width={size} height={size} alt="" aria-hidden="true" />;
}

export default function NextjsPage() {
  return (
    <main className={`${styles.main} ${headingFont.variable}`}>
      <NextjsHero />
      <div className={styles.bodySections}>
        <div className={styles.container}>
          <ul className={styles.highlights} aria-label="Преимущества Next.js">
            {data.highlights.map(({ icon, title, text }) => <li key={title}><Icon name={icon} /><div><h3>{title}</h3><p>{text}</p></div></li>)}
          </ul>

          <section className={styles.section} aria-labelledby="workflow-title">
            <div className={styles.sectionHeading}>
              <div><p className={styles.eyebrow}>ТЕХНОЛОГИЯ</p><h2 id="workflow-title">Как работает <span>Next.js</span></h2><p className={styles.subheading}>Интерфейс, сервер и данные — в одной архитектуре.</p></div>
              <p className={styles.sectionDescription}>Next.js объединяет интерфейс, сервер и данные в одной архитектуре. Серверный рендеринг, статическая генерация и кэширование подбираются под задачи вашего продукта.</p>
            </div>
            <ol className={styles.workflow}>
              {data.workflow.map(({ icon, title, text }, index) => <li key={title}><div className={styles.workflowPanel}><Icon name={icon} size={46} /><h3>{title}</h3></div><p>{text}</p>{index < data.workflow.length - 1 && <span className={styles.workflowArrow} aria-hidden="true"><Icon name="arrow-right" size={28} /></span>}</li>)}
            </ol>
          </section>

          <section className={styles.section} aria-labelledby="benefits-title">
            <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>ПРЕИМУЩЕСТВА</p><h2 id="benefits-title">Почему это важно<br />для <span>бизнеса.</span></h2></div><p className={styles.sectionDescription}>Технология должна работать на ваши цели. Next.js помогает создавать продукты, которые удобно использовать, поддерживать и развивать.</p></div>
            <div className={styles.benefitGrid}>{data.benefits.map(({ icon, title, text }) => <article className={styles.benefitCard} key={title}><Icon name={icon} /><h3>{title}</h3><p>{text}</p></article>)}</div>
          </section>

          <section className={styles.section} aria-labelledby="performance-title">
            <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>РЕЗУЛЬТАТЫ</p><h2 id="performance-title">Производительность и <span>SEO.</span></h2></div><p className={styles.sectionDescription}>Быстрый интерфейс улучшает пользовательский опыт. Серверный рендеринг, метаданные и оптимизация ресурсов создают техническую основу для поисковой видимости.</p></div>
            <Performance />
          </section>

          <section className={styles.section} aria-labelledby="stack-title">
            <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>ТЕХНОЛОГИИ</p><h2 id="stack-title">Современный <span>стек.</span></h2></div><p className={styles.sectionDescription}>Проверенные инструменты для гибкого интерфейса, серверной логики и работы с данными. Состав стека подбирается под проект.</p></div>
            <ul className={styles.stack}>{data.stack.map(({ file, title, text }) => <li key={file}><Image src={`/icons/stack-${file}.svg`} width={52} height={52} alt="" /><div><h3>{title}</h3><p>{text}</p></div></li>)}</ul>
          </section>

          <section className={`${styles.section} ${styles.useCaseSection}`} aria-labelledby="use-cases-title">
            <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>КОГДА ВЫБРАТЬ</p><h2 id="use-cases-title">Когда стоит выбрать <span>Next.js</span></h2></div><p className={styles.sectionDescription}>Когда нужен современный сайт или приложение с быстрым интерфейсом, инструментами SEO и возможностью масштабирования.</p></div>
            <ul className={styles.useCases}>{data.useCases.map(({ icon, title, text }) => <li key={title}><div><Image src={icon} width={36} height={36} alt="" /><h3>{title}</h3></div><p>{text}</p></li>)}</ul>
          </section>
        </div>
      </div>

      <div className={styles.contactBackground}>
        <section className={`${styles.container} ${styles.contact}`} id="contact" aria-labelledby="contact-title">
          <div className={styles.contactCopy}><p className={styles.eyebrow}>СВЯЗАТЬСЯ</p><h2 id="contact-title">Обсудим ваш проект<br />на <span>Next.js.</span></h2><p>Расскажите о вашей задаче, и я предложу оптимальное решение. Напишите в Telegram, по почте или прямо в чат.</p><div className={styles.actions}><a className={styles.primaryButton} href={siteConfig.telegram} target="_blank" rel="noreferrer"><Icon name="telegram" size={22} />Написать в Telegram <span aria-hidden="true">→</span></a><a className={styles.secondaryButton} href={`mailto:${siteConfig.email}`}>Обсудить задачу <span aria-hidden="true">→</span></a></div></div>
          <div className={styles.chatWrap}><ChatWidget /></div>
        </section>
      </div>
    </main>
  );
}
