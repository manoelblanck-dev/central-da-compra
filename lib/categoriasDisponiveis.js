import { supabase } from "@/lib/supabase";

// Slugs das categorias que têm pelo menos 1 produto cadastrado.
// Usado para esconder categorias vazias do site (carrossel, rodapé),
// evitando a sensação de "loja fantasma". Quando um produto é cadastrado
// numa categoria, ela volta a aparecer sozinha (a home/rodapé revalidam).
export async function getCategoriasComProdutos() {
  const { data } = await supabase.from("produtos").select("categoria");
  return [...new Set((data || []).map((p) => p.categoria).filter(Boolean))];
}
