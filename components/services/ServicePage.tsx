import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Contact from "@/components/home/Contact";
import { servicePages, type ServicePageData } from "@/data/services";
import { siteConfig } from "@/config";
import { siteUrl } from "@/lib/seo";
import shared from "@/app/page.module.scss";
import styles from "./ServicePage.module.scss";

export default function ServicePage({ service }: { service: ServicePageData }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.label,
    description: service.description,
    url: new URL(service.path, siteUrl).href,
    serviceType: service.label,
    areaServed: ["Тольятти", "Самарская область", "Россия"],
    provider: { "@type": "Person", name: "Кондрачук Алексей Степанович", url: siteUrl, telephone: siteConfig.phone, email: siteConfig.email },
  };

  return (
    <main className={`${shared.main} ${styles.main}`} id="top">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className={shared.container}>
        <section className={styles.hero}>
          <div>
            <Breadcrumbs title={service.label} path={service.path} />
            <p className={shared.eyebrow}>ТОЛЬЯТТИ · РАБОТАЮ ПО ВСЕЙ РОССИИ</p>
            <h1>{service.heading}<br /><span>{service.accent}</span></h1>
            <p className={styles.intro}>{service.intro}</p>
            <div className={shared.actions}>
              <a className={shared.primaryButton} href="#contact">Обсудить проект <span aria-hidden="true">→</span></a>
              <a className={shared.secondaryButton} href="#work">Посмотреть пример <span aria-hidden="true">↘</span></a>
            </div>
          </div>
          <div className={styles.heroCard}>
            <div className={styles.cardHeader}><span>ЕНОТ / ВЕБ-РАЗРАБОТКА</span><i aria-hidden="true" /></div>
            <Image src={service.project.image} width={1168} height={1346} alt={service.project.alt} sizes="(max-width: 900px) 90vw, 40vw" loading="eager" />
            <div className={styles.cardCaption}><strong>{service.project.name}</strong><span>Пример из портфолио</span></div>
          </div>
        </section>

        <section className={`${shared.section} ${styles.overview}`} aria-labelledby="overview-title">
          <div><p className={shared.eyebrow}>ЗАДАЧА И РЕШЕНИЕ</p><h2 id="overview-title">Сначала задача.<br /><span>Затем сайт.</span></h2></div>
          <div><p>{service.audience}</p><p>Вы общаетесь напрямую с разработчиком. Я нахожусь в Тольятти, работаю с клиентами из Самарской области и удалённо по всей России. Состав работ согласуем до начала разработки.</p><Link href="/about">Подробнее обо мне <span aria-hidden="true">→</span></Link></div>
        </section>

        <section className={shared.section} aria-labelledby="features-title">
          <p className={shared.eyebrow}>СОСТАВ ПРОЕКТА</p>
          <div className={shared.sectionHeading}><h2 id="features-title">Что можно<br /><span>включить в разработку.</span></h2><p>Подбираем функции под ваши процессы.<br />Итоговый объём фиксируем в договорённостях.</p></div>
          <div className={styles.features}>{service.features.map((item, index) => <article key={item.title}><span className={styles.number}>0{index + 1}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
        </section>

        <section className={shared.section} aria-labelledby="steps-title">
          <p className={shared.eyebrow}>ПРОЦЕСС</p>
          <div className={shared.sectionHeading}><h2 id="steps-title">От обсуждения<br /><span>до запуска.</span></h2><p>Понятные этапы и согласование результата.</p></div>
          <div className={shared.steps}>{service.steps.map((step, index) => <article key={step.title}><div><strong>0{index + 1}</strong><i aria-hidden="true" /></div><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
        </section>

        <section className={`${shared.section} ${styles.project}`} id="work" aria-labelledby="work-title">
          <div><p className={shared.eyebrow}>ПРИМЕР РАБОТЫ</p><h2 id="work-title">{service.project.name}</h2><p>{service.project.description}</p><Link className={shared.secondaryButton} href="/#projects">Смотреть портфолио <span aria-hidden="true">→</span></Link></div>
          <Link href="/#projects" className={styles.projectImage} aria-label={`Посмотреть ${service.project.name} в портфолио`}><Image src={service.project.image} width={1168} height={1346} alt={service.project.alt} sizes="(max-width: 900px) 90vw, 45vw" /></Link>
        </section>

        <section className={`${shared.section} ${styles.estimate}`} aria-labelledby="estimate-title">
          <div><p className={shared.eyebrow}>СТОИМОСТЬ И СРОКИ</p><h2 id="estimate-title">Оценка под<br /><span>ваш проект.</span></h2><p>{service.estimate}</p><a className={shared.primaryButton} href="#contact">Получить оценку <span aria-hidden="true">→</span></a></div>
          <div className={styles.brief}><h3>Что рассказать для оценки</h3><ul>{service.brief.map((item) => <li key={item}>{item}</li>)}</ul><p>Можно начать с короткого сообщения в чате. Если есть техническое задание — пришлите его по почте.</p><Link href="/documents">Документы и условия работы <span aria-hidden="true">→</span></Link></div>
        </section>

        <section className={shared.section} aria-labelledby="faq-title">
          <p className={shared.eyebrow}>ВОПРОСЫ И ОТВЕТЫ</p><h2 id="faq-title">Перед <span>началом работы.</span></h2>
          <div className={styles.faq}>{service.faq.map((item) => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div>
        </section>

        <nav className={styles.related} aria-label="Другие услуги"><span>Другие направления</span>{Object.values(servicePages).filter((item) => item.path !== service.path).map((item) => <Link key={item.path} href={item.path}>{item.label} <span aria-hidden="true">→</span></Link>)}</nav>
        <Contact content={{ eyebrow: "ОБСУДИМ ПРОЕКТ", title: "Расскажите о вашей задаче.", description: ["Напишите, какой сайт вам нужен и для какого бизнеса.", "Обсудим состав работ, стоимость и следующий шаг."], telegramAction: "Написать в Telegram", githubAction: "Открыть GitHub" }} />
      </div>
    </main>
  );
}

