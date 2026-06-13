/** @type {import('next').NextConfig} */
const nextConfig = {
  // Usamos a tag <img> comum (em vez de next/image) para aceitar
  // fotos de produtos de qualquer site (Shopee, Mercado Livre, etc.)
  // sem precisar configurar domínios um por um.
  reactStrictMode: true,
};

module.exports = nextConfig;
