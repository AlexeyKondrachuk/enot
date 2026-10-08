import type { Metadata } from "next";
import { siteConfig } from "@/config";

// Set the public production origin, without a path, before deployment.
export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://enotgo.ru").origin;

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const fullTitle = `${title} — ${siteConfig.name}`;
  return {
    title,
    description,
    ...(siteUrl ? { alternates: { canonical: new URL(path, siteUrl).href } } : {}),
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      ...(siteUrl ? { url: new URL(path, siteUrl).href } : {}),
      images: [{ url: "/og-cover.jpg", width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ["/og-cover.jpg"],
    },
  };
}
