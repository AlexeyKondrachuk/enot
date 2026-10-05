import { pageMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Image from "next/image";
import Link from "next/link";
import { aboutData as data } from "@/data/about";
import Contact from "@/components/home/Contact";
import { siteConfig } from "@/config";
import shared from "@/app/page.module.scss";
import styles from "./page.module.scss";

export const metadata = pageMetadata(data.metadata.title, data.metadata.description, "/about");

function Icon({ name }: { name: "monitor" | "people" | "code" | "chart" | "briefcase" | "layers" | "calendar" | "star" }) {
  if (name === "monitor") return <Image src="/icons/monitor.svg" width={36} height={36} alt="" />;
  const paths = {
    people: <><circle cx="12" cy="9" r="4"/><path d="M3 27v-4a9 9 0 0 1 18 0v4H3ZM23 5a4 4 0 0 1 0 8M25 18a7 7 0 0 1 5 7v2h-5"/></>,
    code: <><path d="m10 8-8 8 8 8M22 8l8 8-8 8M19 4l-6 24"/></>,
    chart: <><path d="M3 29h27M7 23V13h4v10M16 23V8h4v15M25 23V3h4v20"/></>,
    briefcase: <><rect x="3" y="9" width="26" height="20" rx="3"/><path d="M10 9V5h12v4M3 16l13 4 13-4M16 18v5"/></>,
    layers: <><path d="m16 2 14 8-14 8L2 10 16 2ZM2 17l14 8 14-8M2 24l14 8 14-8"/></>,
    calendar: <><rect x="3" y="6" width="26" height="24" rx="3"/><path d="M3 13h26M10 2v8M22 2v8M10 20h1M16 20h1M22 20h1M10 25h1M16 25h1"/></>,
    star: <path d="m16 2 4.3 9 9.7 1.4-7 6.8 1.7 9.6L16 24.3l-8.7 4.5L9 19.2l-7-6.8 9.7-1.4L16 2Z"/>,
  };
  return <svg width="36" height="36" viewBox="0 0 32 34" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function AboutPage() {
  return <main className={`${shared.main} ${styles.main}`}>
    <section className={styles.hero} id="top">
      <div className={styles.portrait}><Image src="/about-hero-person.webp" alt={data.hero.imageAlt} width={900} height={600} sizes="(max-width: 760px) 100vw, 70vw" loading="eager" /></div>
      <div className={`${shared.container} ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <Breadcrumbs title="Обо мне" path="/about" />
          <p className={shared.eyebrow}>{data.hero.eyebrow}</p>
          <h1>{data.hero.title[0]}<br/>{data.hero.title[1]}<br/><span>{data.hero.title[2]}</span></h1>
          <p className={shared.lead}>{data.hero.introduction}<br/>{data.hero.description}</p>
          <div className={shared.actions}><a className={shared.primaryButton} href="#contact">{data.hero.primaryAction} <span aria-hidden="true">→</span></a><a className={shared.secondaryButton} href={siteConfig.telegram} target="_blank" rel="noreferrer">{data.hero.secondaryAction} <span aria-hidden="true">→</span></a></div>
        </div>
      </div>
    </section>
    <div className={shared.container}>
      <div className={styles.benefits}>{data.benefits.map(({ icon, title, text }) => <div key={title}><Icon name={icon}/><p><strong>{title}</strong><span>{text}</span></p></div>)}</div>
      <section className={shared.section} aria-labelledby="experience-title">
        <p className={shared.eyebrow}>{data.experience.eyebrow}</p>
        <div className={shared.sectionHeading}><h2 id="experience-title">{data.experience.title}<br/>{data.experience.continuation} <span>{data.experience.accent}</span></h2><p>{data.experience.description}</p></div>
        <div className={styles.principles}>{data.experience.principles.map(item => <article key={item.title}><Icon name={item.icon}/><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      </section>
      <section className={shared.section} id="approach" aria-labelledby="approach-title">
        <p className={shared.eyebrow}>{data.approach.eyebrow}</p>
        <div className={shared.sectionHeading}><h2 id="approach-title">{data.approach.title} <span>{data.approach.accent}</span></h2><p>{data.approach.description}</p></div>
        <div className={shared.steps}>{data.approach.steps.map(({ title, text }, index) => <article key={title}><div><strong>0{index + 1}</strong><i aria-hidden="true"/></div><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>
      <section className={shared.section} aria-labelledby="stack-title">
        <p className={shared.eyebrow}>{data.expertise.eyebrow}</p>
        <div className={shared.sectionHeading}><h2 id="stack-title">{data.expertise.title}<br/>{data.expertise.continuation} <span>{data.expertise.accent}</span></h2><p>{data.expertise.description}</p></div>
        <ul className={styles.stack}>{data.expertise.stack.map(({ file, title }) => <li key={file}><Image src={`/icons/stack-${file}.svg`} width={36} height={36} alt=""/><span>{title}</span></li>)}</ul>
      </section>
      <section className={shared.section} aria-labelledby="result-title">
        <p className={shared.eyebrow}>{data.result.eyebrow}</p>
        <div className={shared.sectionHeading}><h2 id="result-title">{data.result.title}<br/><span>{data.result.accent}</span></h2><div><p>{data.result.description}</p><Link href="/#projects">{data.result.action} <span aria-hidden="true">→</span></Link></div></div>
        <div className={styles.outcomes}>{data.result.outcomes.map(({ icon, title, text }) => <div key={title}><Icon name={icon}/><p><strong>{title}</strong><span>{text}</span></p></div>)}</div>
      </section>
      <Contact content={data.contact}/>
    </div>
  </main>;
}
