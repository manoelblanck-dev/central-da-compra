import { supabase } from "@/lib/supabase";

// As subcategorias ficam no config (chave "subcategorias") como um objeto que
// liga cada categoria à sua lista: { "moda": [{ slug, nome }], "casa": [...] }.
// Mesmo padrão de cupons/jogo/categorias.

// Garante o formato certo (objeto { catSlug: [{slug,nome}] }), descartando lixo.
export function limparMapaSub(valor) {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) return {};
  const out = {};
  for (const [cat, lista] of Object.entries(valor)) {
    if (!Array.isArray(lista)) continue;
    const limpa = lista
      .filter((s) => s && s.slug && s.nome)
      .map((s) => ({ slug: String(s.slug), nome: String(s.nome) }));
    if (limpa.length) out[cat] = limpa;
  }
  return out;
}

// Lê o mapa completo de subcategorias (servidor).
export async function getSubcategoriasMapa() {
  const { data } = await supabase
    .from("config")
    .select("valor")
    .eq("chave", "subcategorias")
    .maybeSingle();
  return limparMapaSub(data?.valor);
}

// Subcategorias de uma categoria (lista; pode ser vazia).
export function subcategoriasDe(mapa, catSlug) {
  return (mapa && mapa[catSlug]) || [];
}

// Nome de exibição de uma subcategoria. Se não achar, "embeleza" o slug
// (ex.: "moda-praia" -> "Moda Praia"), nunca quebra.
export function nomeSubcategoria(mapa, catSlug, subSlug) {
  if (!subSlug) return "";
  const achada = subcategoriasDe(mapa, catSlug).find((s) => s.slug === subSlug);
  if (achada) return achada.nome;
  return String(subSlug)
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}
