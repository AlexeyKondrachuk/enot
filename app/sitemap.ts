import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];
  return ["/", "/about", "/nextjs", "/documents"].map((path) => ({ url: new URL(path, siteUrl).href }));
}
