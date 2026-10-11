import type { LandingData } from "@/Redux/api";
import styles from "@/app/page.module.scss";
import ServiceIcon from "./ServiceIcon";
import Link from "next/link";
import { servicePages } from "@/data/services";

export default function Services({
  items,
}: {
  items: LandingData["services"];
}) {
  return (
    <section className={styles.section} id="services">
      <p className={styles.eyebrow}>МОИ УСЛУГИ</p>
      <div className={styles.sectionHeading}>
        <h2>
          От идеи до <span>работающего продукта.</span>
        </h2>
        <p>
          Создаю современные веб-решения,
          <br />
          которые помогают вашему бизнесу
          <br />
          развиваться и приносить результат.
        </p>
      </div>
      <div className={styles.services}>
        {items.map((service, index) => (
          <article key={service.title}>
            <div className={styles.serviceTop}>
              <strong>0{index + 1}</strong>
              <ServiceIcon index={index} />
            </div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            {service.title === "Корпоративные сайты" && <Link href={servicePages.corporate.path}>Подробнее об услуге →</Link>}
            {service.title === "Интернет-магазины" && <Link href={servicePages.store.path}>Подробнее об услуге →</Link>}
          </article>
        ))}
      </div>
      <div className={styles.actions} style={{ marginTop: 28 }}>
        <Link className={styles.secondaryButton} href={servicePages.websites.path}>Создание сайтов: как начать <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  );
}
