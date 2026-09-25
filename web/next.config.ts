import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // postgres and undici are server-only; keep them out of the bundler.
  serverExternalPackages: ["postgres", "undici"],
};

export default nextConfig;
