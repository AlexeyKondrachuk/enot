import LandingPage from "@/components/home/LandingPage";
import { pageMetadata, searchImage, siteUrl } from "@/lib/seo";
import { siteConfig } from "@/config";

const description = `${siteConfig.description.trimEnd().replace(/[.!?]$/, "")}. Макет главной страницы бесплатно.`;

export const metadata = {
  ...pageMetadata("Fullstack-разработка сайтов и веб-приложений", description, "/"),
  title: { absolute: `${siteConfig.name} — Fullstack-разработка сайтов и веб-приложений` },
};

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}/#webpage`,
    url: `${siteUrl}/`,
    name: `${siteConfig.name} — Fullstack-разработка сайтов и веб-приложений`,
    description,
    primaryImageOfPage: {
      "@type": "ImageObject",
      contentUrl: searchImage.url,
      url: searchImage.url,
      width: searchImage.width,
      height: searchImage.height,
      caption: searchImage.alt,
    },
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <LandingPage/>
  </>;
}
