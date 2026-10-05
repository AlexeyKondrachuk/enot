import Image from "next/image";
import styles from "@/app/layout.module.scss";
import { siteConfig } from "@/config";

export default function Logo() {
  return (
    <a
      className={styles.logo}
      href="/"
      aria-label={`${siteConfig.name} — на главную`}
    >
      <Image src="/enot-color.svg" width={1672} height={580} alt="" priority />
    </a>
  );
}
