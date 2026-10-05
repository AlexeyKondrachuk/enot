import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "stylishly-simple-chicken.cloudpub.ru",
    ...(process.env.ALLOWED_DEV_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? []),
  ],
  async headers() {
    return [{
      source: "/sw.js",
      headers: [
        { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
      ],
    }];
  },
};

export default nextConfig;
