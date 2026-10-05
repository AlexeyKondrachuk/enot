import type { LandingData } from "@/Redux/api";
import styles from "@/app/page.module.scss";
import ServiceIcon from "./ServiceIcon";

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
          </article>
        ))}
      </div>
    </section>
  );
}
