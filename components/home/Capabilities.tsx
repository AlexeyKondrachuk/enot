import type { LandingData } from "@/Redux/api";
import styles from "@/app/page.module.scss";
import ServiceIcon from "./ServiceIcon";

export default function Capabilities({
  items,
}: {
  items: LandingData["capabilities"];
}) {
  return (
    <div className={styles.capabilities}>
      {items.map((item, index) => (
        <div key={item.title}>
          <ServiceIcon index={index} />
          <p>
            <b>{item.title}</b>
            <span>{item.description}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
