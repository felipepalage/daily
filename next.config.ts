import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera um servidor auto-contido em .next/standalone para o deploy em Docker.
  output: "standalone",
};

export default nextConfig;
