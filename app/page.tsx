import LandingPage from "@/components/home/LandingPage";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config";

export const metadata = {
  ...pageMetadata("Fullstack-разработка сайтов и веб-приложений", siteConfig.description, "/"),
  title: { absolute: `${siteConfig.name} — Fullstack-разработка сайтов и веб-приложений` },
};

export default function Home() {
  return <LandingPage/>;
}
