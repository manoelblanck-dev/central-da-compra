/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Aceita imagens de qualquer site via https (Shopee, Mercado Livre,
    // Supabase, URLs coladas...) e ainda assim otimiza (WebP, tamanhos
    // responsivos, carregamento preguiçoso) — deixa o site bem mais leve.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

module.exports = nextConfig;
