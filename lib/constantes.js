// Link do canal/grupo de ofertas no WhatsApp.
// Enquanto estiver VAZIO (""), os botões de WhatsApp NÃO aparecem no site.
// Para ativar: cole aqui o link do canal (ex.: "https://whatsapp.com/channel/XXXX"
// ou de grupo "https://chat.whatsapp.com/XXXX") e os botões surgem em todo o site.
export const WHATSAPP_URL = "https://chat.whatsapp.com/JYBLRNIzWeaJLSCW3eEbhd";

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

// Nome de exibição de uma categoria. Aceita uma lista (built-in + criadas
// pelo usuário); se não achar, "embeleza" o slug (ex.: "moda-praia" ->
// "Moda Praia") em vez de cair sempre em "Outros". Nunca quebra.
export function nomeCategoria(slug, lista = CATEGORIAS) {
  if (!slug) return "Outros";
  const achada = (lista || CATEGORIAS).find((c) => c.slug === slug);
  if (achada) return achada.nome;
  return String(slug)
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

// Gera um slug seguro a partir de um texto (ex.: "Moda Praia!" -> "moda-praia").
export function gerarSlug(texto) {
  return (texto || "")
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

// Resolve um texto digitado (nome OU slug de categoria) para um slug existente
// na lista. Se não encontrar, gera um slug a partir do texto. Vazio -> "outros".
export function normalizarCategoria(valor, lista = CATEGORIAS) {
  const v = normalizarTexto(valor);
  if (!v) return "outros";
  const achada = (lista || CATEGORIAS).find(
    (c) => normalizarTexto(c.slug) === v || normalizarTexto(c.nome) === v
  );
  if (achada) return achada.slug;
  return gerarSlug(valor) || "outros";
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

// Remove acentos e deixa em minúsculas, para comparar textos digitados
// (ex: "Mercado Livre", "mercado livre") com os códigos internos.
function normalizarTexto(txt) {
  return (txt || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Converte um texto digitado (ex: "Mercado Livre", "ML", "shopee") no código
// interno da plataforma (ex: "mercado_livre"). Devolve null se não reconhecer.
export function normalizarPlataforma(valor) {
  const v = normalizarTexto(valor);
  if (!v) return null;

  const vSemEspaco = v.replace(/[\s_-]/g, "");
  if (vSemEspaco === "ml") return "mercado_livre";

  const encontrada = PLATAFORMAS.find((p) => {
    const id = normalizarTexto(p.id);
    const nome = normalizarTexto(p.nome);
    return (
      id === v ||
      id.replace(/_/g, " ") === v ||
      id.replace(/_/g, "") === vSemEspaco ||
      nome === v ||
      nome.replace(/\s/g, "") === vSemEspaco
    );
  });

  return encontrada ? encontrada.id : null;
}

// Detecta a plataforma a partir do link de afiliado (auto-preenche no cadastro).
export function detectarPlataforma(link) {
  const l = (link || "").toLowerCase();
  if (l.includes("shopee") || l.includes("shope.ee")) return "shopee";
  if (
    l.includes("mercadolivre") ||
    l.includes("mercadolibre") ||
    l.includes("meli.la") ||
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
