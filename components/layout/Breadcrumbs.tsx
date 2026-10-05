import Link from "next/link";
import { siteUrl } from "@/lib/seo";
import styles from "./Breadcrumbs.module.scss";

export default function Breadcrumbs({ title, path }: { title: string; path: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: siteUrl ? `${siteUrl}/` : "/" },
      { "@type": "ListItem", position: 2, name: title, ...(siteUrl ? { item: new URL(path, siteUrl).href } : {}) },
    ],
  };

  return <>
    <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
      <ol>
        <li><Link href="/">Главная</Link></li>
        <li><span className={styles.separator} aria-hidden="true">/</span><span aria-current="page">{title}</span></li>
      </ol>
    </nav>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
  </>;
}
