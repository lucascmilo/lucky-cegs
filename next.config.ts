import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Esconde o ícone do Next durante o desenvolvimento
  devIndicators: false,
  // Todas as imagens saem com qualidade 90 (o padrão é 75)
  images: {
    qualities: [90],
  },
};

export default nextConfig;
