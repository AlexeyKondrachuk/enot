import type { LandingData } from "@/Redux/api";
import Link from "next/link";
import Image from "next/image";
import styles from "@/app/page.module.scss";

type ApproachProps = Pick<LandingData, "stack" | "steps">;

const technologyIcons: Record<string, string> = {
  "Next.js": "nextjs",
  React: "react",
  TypeScript: "typescript",
  "Node.js": "nodejs",
  PostgreSQL: "postgresql",
};

export default function Approach({ stack, steps }: ApproachProps) {
  return <section className={`${styles.section} ${styles.approach}`} id="approach">
    <p className={styles.eyebrow}>МОЙ ПОДХОД</p>
    <div className={styles.sectionHeading}>
      <h2>Один разработчик.<br/>Целостный <span>продукт.</span></h2>
      <div><p>Я веду проект от первого обсуждения<br/>до запуска: интерфейс, серверная логика<br/>и интеграции.</p><div className={styles.tags}>{stack.map(item => {
        const icon = technologyIcons[item];
        const label = <>{icon && <Image src={`/icons/stack-${icon}.svg`} width={20} height={20} alt="" aria-hidden="true"/>}{item}</>;
        return <span key={item}>{item === "Next.js" ? <Link href="/nextjs">{label} →</Link> : label}</span>;
      })}</div></div>
    </div>
    <div className={styles.steps}>{steps.map((step, index) => <article key={step.title}><div><strong>0{index + 1}</strong><i/></div><h3>{step.title}</h3><p>{step.description}</p></article>)}</div>
  </section>;
}
