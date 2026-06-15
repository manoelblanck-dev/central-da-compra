import { supabase } from "@/lib/supabase";
import { CATEGORIAS } from "@/lib/constantes";

// Categorias criadas pelo usuário no painel, guardadas no config (chave
// "categorias") como [{ slug, nome, emoji }]. Mesmo padrão de cupons/jogo.
export async function getCategoriasCustom() {
  const { data } = await supabase
    .from("config")
    .select("valor")
    .eq("chave", "categorias")
    .maybeSingle();
  const lista = Array.isArray(data?.valor) ? data.valor : [];
  return lista
    .filter((c) => c && c.slug && c.nome)
    .map((c) => ({ slug: c.slug, nome: c.nome, emoji: c.emoji || "🏷️" }));
}

// Lista completa: categorias fixas (built-in) + as criadas pelo usuário.
// Custom não pode sobrescrever uma built-in (mesmo slug é ignorado).
export async function getTodasCategorias() {
  const custom = await getCategoriasCustom();
  const fixos = new Set(CATEGORIAS.map((c) => c.slug));
  const extras = custom.filter((c) => !fixos.has(c.slug));
  return [...CATEGORIAS, ...extras];
}
