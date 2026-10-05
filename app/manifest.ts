import type { MetadataRoute } from "next";
import { siteConfig } from "@/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — сообщения`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    id: "/admin/chat",
    start_url: "/admin/chat",
    scope: "/",
    display: "standalone",
    background_color: "#07131c",
    theme_color: "#07131c",
    icons: [
      { src: "/pwa-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
