import { pageMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Image from "next/image";
import { Oswald } from "next/font/google";
import ChatWidget from "@/components/home/ChatWidget";
import DocumentActions from "@/components/documents/DocumentActions";
import { siteConfig } from "@/config";
import styles from "./page.module.scss";

const heading = Oswald({ subsets: ["latin", "cyrillic"], weight: ["500", "600"], display: "swap", variable: "--documents-heading" });

export const metadata = pageMetadata("Документы и условия работы", "Понятные документы для спокойной работы над проектом: договор, акт приёма-передачи и сопровождение.", "/documents");

const documents = [
  { image: "5", title: "Договор", text: "Создание корпоративного сайта и настройка почты.", href: "/documents/01_dogovor_sozdaniya_sayta_i_pochty.pdf", pages: "5 страниц", points: ["Техническое задание и сроки", "Стоимость и порядок оплаты", "Передача исходников и прав", "Условия работы с самозанятым"] },
  { image: "6", title: "Акт приёма-передачи", text: "Подтверждаем выполнение и передачу результата.", href: "/documents/02_akt_priema_peredachi.pdf", pages: "1 страница", points: ["Перечень выполненных работ", "Проверка сайта и почты", "Передача файлов и доступов", "Замечания и подписи сторон"] },
  { image: "7", title: "Обслуживание", text: "Техническая поддержка сайта после запуска.", href: "/documents/03_dogovor_obsluzhivaniya_sayta.pdf", pages: "4 страницы", points: ["Состав услуг и лимиты", "Резервные копии и обновления", "Приёмка услуг и отчётность", "Регламент и сроки реакции"] },
];

const steps = [
  { n: "01", icon: "monitor", title: "Обсуждение", text: "Обсуждаем задачи, состав работ и условия сотрудничества." },
  { n: "02", icon: "11", title: "Согласование", text: "Фиксируем договорённости в документе." },
  { n: "03", icon: "12", title: "Подписание", text: "Подписываем договор в удобном формате." },
  { n: "04", icon: "play", title: "Выполнение", text: "Приступаем к работе и выполняем проект по согласованным условиям." },
];

const terms = [
  { icon: "target", title: "Объём работ", text: "Подробное описание задач, этапов и ожидаемого результата." },
  { icon: "calendar", title: "Сроки", text: "Согласованные сроки выполнения каждого этапа и всего проекта." },
  { icon: "database", title: "Стоимость", text: "Фиксированная стоимость и порядок оплаты." },
  { icon: "users", title: "Права и обязанности", text: "Ответственность сторон, порядок внесения изменений и условия сотрудничества." },
];

const faqs = [
  "В каком формате заключается договор?",
  "Можно ли внести изменения в договор?",
  "Когда подписывается акт приёма-передачи?",
  "Предоставляете ли вы документы в электронном виде?",
  "Входит ли обслуживание в стоимость проекта?",
];

function Icon({ name, size = 34 }: { name: string; size?: number }) {
  const shared = { width: size, height: size, viewBox: "0 0 40 40", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (name === "monitor") return <svg {...shared}><rect x="5" y="7" width="30" height="21" rx="2"/><path d="M20 28v6m-8 0h16"/></svg>;
  if (name === "play") return <svg {...shared}><path d="M12 7v26l21-13z"/></svg>;
  if (name === "target") return <svg {...shared}><circle cx="19" cy="21" r="13"/><circle cx="19" cy="21" r="7"/><path d="m18 22 16-16m-7 0h7v7"/></svg>;
  if (name === "calendar") return <svg {...shared}><rect x="5" y="8" width="30" height="27" rx="3"/><path d="M12 5v7m16-7v7M5 16h30m-23 6h3m5 0h3m5 0h3m-16 6h3m5 0h3"/></svg>;
  if (name === "database") return <svg {...shared}><ellipse cx="20" cy="9" rx="14" ry="5"/><path d="M6 9v22c0 3 6 5 14 5s14-2 14-5V9M6 20c0 3 6 5 14 5s14-2 14-5"/></svg>;
  if (name === "users") return <svg {...shared}><circle cx="15" cy="12" r="6"/><path d="M3 34v-3a12 12 0 0 1 24 0v3z"/><circle cx="30" cy="14" r="4"/><path d="M29 24a9 9 0 0 1 8 9v1h-7"/></svg>;
  return <Image src={`/documents/${name}.webp`} width={size} height={size} alt="" aria-hidden="true" />;
}

export default function DocumentsPage() {
  return <main className={`${styles.main} ${heading.variable}`}>
    <section className={styles.hero} id="top">
      <div className={styles.heroArtwork}><Image src="/documents/hero.webp" alt="Стеклянные документы с отметкой согласования" fill priority sizes="(max-width: 760px) 120vw, 90vw" /></div>
      <div className={`${styles.container} ${styles.heroInner}`}>
        <Breadcrumbs title="Документы" path="/documents" />
        <p className={styles.eyebrow}>ПРОЗРАЧНАЯ РАБОТА · НАДЁЖНЫЙ РЕЗУЛЬТАТ</p>
        <h1>Документы<br />Всё прозрачно.<br /><span>Всё зафиксировано.</span></h1>
        <p className={styles.heroLead}>Понятные документы для спокойной работы над проектом.</p>
        <div className={styles.actions}><a className={styles.primaryButton} href="#contact">Обсудить условия <span>→</span></a><a className={styles.secondaryButton} href="#documents">Посмотреть пример <span>→</span></a></div>
      </div>
    </section>

    <div className={styles.bodySections}><div className={styles.container}>
      <ul className={styles.highlights} aria-label="Наш подход">
        <li><Icon name="9" size={42}/><div><h3>Официальный подход</h3><p>Чёткие условия и обязанности</p></div></li>
        <li><Icon name="10" size={42}/><div><h3>Понятные документы</h3><p>Простые и прозрачные формулировки</p></div></li>
        <li><Icon name="11" size={42}/><div><h3>Удобный формат</h3><p>Электронный документооборот</p></div></li>
      </ul>

      <section className={styles.section} id="documents" aria-labelledby="documents-title">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>ОСНОВНЫЕ ДОКУМЕНТЫ</p><h2 id="documents-title">Три ключевых <span>документа.</span></h2></div><p className={styles.sectionDescription}>Оформляем сотрудничество так, чтобы все условия были понятны и зафиксированы на каждом этапе проекта.</p></div>
        <p className={styles.templateNote}>Шаблоны для ООО и самозанятого. Стоимость и реквизиты оставлены пустыми: заполните их вместе со сроками и составом работ перед подписанием.</p>
        <div className={styles.documentGrid}>{documents.map((doc) => <article className={styles.documentCard} key={doc.title}><div className={styles.documentArtwork}><Image src={`/documents/${doc.image}.webp`} alt="" fill sizes="(max-width: 760px) 90vw, 30vw" /></div><div className={styles.documentContent}><h3>{doc.title}</h3><p className={styles.cardLead}>{doc.text}</p><ul>{doc.points.map((point) => <li key={point}><span aria-hidden="true">✓</span>{point}</li>)}</ul><p className={styles.documentMeta}>PDF · {doc.pages}</p><DocumentActions href={doc.href} title={doc.title}/></div></article>)}</div>
      </section>

      <section className={styles.section} aria-labelledby="steps-title">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>ЭТАПЫ РАБОТЫ</p><h2 id="steps-title">Как проходит <span>оформление.</span></h2></div><p className={styles.sectionDescription}>Простой и понятный процесс, который экономит ваше время.</p></div>
        <ol className={styles.steps}>{steps.map((step) => <li key={step.n}><div className={styles.stepTop}><span>{step.n}</span><Icon name={step.icon} size={42}/></div><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
      </section>

      <section className={styles.section} aria-labelledby="terms-title">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>ЧТО ЗАФИКСИРОВАНО</p><h2 id="terms-title">Что зафиксировано <span>в документах.</span></h2></div><p className={styles.sectionDescription}>Документы защищают интересы обеих сторон и помогают избежать недопонимания в процессе работы.</p></div>
        <div className={styles.termsGrid}>{terms.map((term) => <article className={styles.termCard} key={term.title}><Icon name={term.icon}/><h3>{term.title}</h3><p>{term.text}</p></article>)}</div>
      </section>

      <section className={styles.section} aria-labelledby="faq-title">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>ОТВЕТЫ НА ВОПРОСЫ</p><h2 id="faq-title">Частые <span>вопросы.</span></h2></div><p className={styles.sectionDescription}>Если у вас остались вопросы — напишите в удобный для вас мессенджер. Мы всегда на связи и с радостью всё объясним.</p></div>
        <div className={styles.faq}>{faqs.map((question, i) => <details key={question}><summary><span className={styles.questionMark}>?</span><span>{question}</span><span className={styles.chevron} aria-hidden="true">⌄</span></summary><p>{["Договор оформляем в письменном виде. Формат и способ подписания согласуем заранее — можно подписать электронно или на бумаге.", "Да. Все изменения обсуждаем и фиксируем письменно до начала соответствующих работ.", "После завершения согласованного объёма работ и передачи результата.", "Да, документы можно подписать и передать в электронном виде.", "Условия поддержки и её стоимость согласуем отдельно и укажем в договоре."][i]}</p></details>)}</div>
      </section>
    </div></div>

    <div className={styles.contactBackground}><section className={`${styles.container} ${styles.contact}`} id="contact" aria-labelledby="contact-title">
      <div className={styles.contactCopy}><p className={styles.eyebrow}>СВЯЗАТЬСЯ</p><h2 id="contact-title">Готовы обсудить <span>ваш проект?</span></h2><p>Расскажите о ваших задачах, и мы предложим удобный формат сотрудничества. Ответим на вопросы и подготовим документы под ваш проект.</p><div className={styles.actions}><a className={styles.primaryButton} href={siteConfig.telegram} target="_blank" rel="noreferrer">Написать в Telegram <span>→</span></a><a className={styles.secondaryButton} href="#contact">Обсудить условия <span>→</span></a></div></div>
      <div className={styles.chatWrap}><ChatWidget/></div>
    </section></div>
  </main>;
}
