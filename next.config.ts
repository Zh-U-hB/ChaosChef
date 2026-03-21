import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      tailwindcss: path.join(__dirname, "node_modules/tailwindcss/index.css"),
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "oaidalleapiprodscus.blob.core.windows.net" },
      { protocol: "https", hostname: "*.openai.com" },
      { protocol: "https", hostname: "*.volces.com" },
      { protocol: "https", hostname: "*.volccdn.com" },
    ],
  },
};

export default nextConfig;
