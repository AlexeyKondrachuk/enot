import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { servicePages } from "@/data/services";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];
  return ["/", "/about", "/nextjs", "/documents", ...Object.values(servicePages).map((service) => service.path)].map((path) => ({ url: new URL(path, siteUrl).href }));
}
