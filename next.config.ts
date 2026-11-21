import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Esconde o ícone do Next no canto da tela durante o desenvolvimento
  // (erros de compilação e de execução continuam aparecendo).
  devIndicators: false,
  // Qualidade 90 para as imagens otimizadas pelo next/image (o padrão é 75).
  // Como a lista só tem 90, qualquer <Image> sem "quality" também sai com 90.
  images: {
    qualities: [90],
  },
};

export default nextConfig;
