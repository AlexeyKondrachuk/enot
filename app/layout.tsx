import type { Metadata } from "next";
import SiteChrome from "@/components/layout/SiteChrome";
import ServiceWorkerRegistration from "@/components/layout/ServiceWorkerRegistration";
import YandexMetrika from "@/components/layout/YandexMetrika";
import { siteConfig } from "@/config";
import "./globals.css";
import Providers from "./providers";
import { pageMetadata, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata("Fullstack-разработка сайтов и веб-приложений", siteConfig.description, "/"),
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  // Canonical belongs to each page, so unknown routes don't inherit the homepage URL.
  alternates: undefined,
  title: {
    default: `${siteConfig.name} — Fullstack-разработка сайтов и веб-приложений`,
    template: `%s — ${siteConfig.name}`,
  },
  applicationName: siteConfig.name,
  robots: { index: true, follow: true },
  icons: {
    icon: { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID ?? "113568821");
  return (
    <html lang="ru">
      <body>
        {Number.isSafeInteger(metrikaId) && metrikaId > 0 && <YandexMetrika counterId={metrikaId} />}
        <ServiceWorkerRegistration />
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
