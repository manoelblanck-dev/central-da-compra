// Categorias da loja (o "slug" é o que vai salvo no banco).
export const CATEGORIAS = [
  { slug: "selecao", nome: "Seleção Brasileira", emoji: "flag", copa: true },
  { slug: "achados-videos", nome: "Achados dos Vídeos", emoji: "🎬", video: true },
  { slug: "eletronicos", nome: "Eletrônicos", emoji: "📱" },
  { slug: "moda", nome: "Moda", emoji: "👗" },
  { slug: "casa", nome: "Casa & Decoração", emoji: "🛋️" },
  { slug: "beleza", nome: "Beleza & Saúde", emoji: "💄" },
  { slug: "esporte", nome: "Esporte & Lazer", emoji: "⚽" },
  { slug: "infantil", nome: "Bebês & Crianças", emoji: "🧸" },
  { slug: "pet", nome: "Pet", emoji: "🐾" },
  { slug: "outros", nome: "Outros", emoji: "✨" },
];

export function nomeCategoria(slug) {
  return CATEGORIAS.find((c) => c.slug === slug)?.nome || "Outros";
}

// Plataformas de afiliado (o "id" é o que vai salvo no banco).
export const PLATAFORMAS = [
  { id: "shopee", nome: "Shopee", cor: "#EE4D2D", textoClaro: true },
  { id: "mercado_livre", nome: "Mercado Livre", cor: "#FFE600", textoClaro: false },
  { id: "tiktok_shop", nome: "TikTok Shop", cor: "#111111", textoClaro: true },
];

export function dadosPlataforma(id) {
  return (
    PLATAFORMAS.find((p) => p.id === id) || {
      id,
      nome: id,
      cor: "#888888",
      textoClaro: true,
    }
  );
}

// Detecta a plataforma a partir do link de afiliado (auto-preenche no cadastro).
export function detectarPlataforma(link) {
  const l = (link || "").toLowerCase();
  if (l.includes("shopee") || l.includes("shope.ee")) return "shopee";
  if (
    l.includes("mercadolivre") ||
    l.includes("mercadolibre") ||
    l.includes("/sec/") ||
    l.includes("mlb")
  )
    return "mercado_livre";
  if (l.includes("tiktok")) return "tiktok_shop";
  return null;
}

// Formata número como Real brasileiro: 1234.5 -> "R$ 1.234,50"
export function formatarPreco(valor) {
  if (valor === null || valor === undefined || valor === "") return null;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor));
}

// Limpa o termo de busca de caracteres que têm significado especial nos
// filtros do PostgREST (evita quebra/injeção na busca simples de fallback).
export function sanitizarBusca(q) {
  return (q || "")
    .replace(/[%,()\\*:]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}
