import { supabase } from "@/lib/supabase";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

async function buscar(q) {
  if (!q) return [];
  const { data } = await supabase
    .from("produtos")
    .select("*")
    .or(`nome.ilike.%${q}%,descricao.ilike.%${q}%`)
    .order("criado_em", { ascending: false })
    .limit(48);
  return data || [];
}

export default async function BuscaPage({ searchParams }) {
  const q = (searchParams?.q || "").trim();
  const produtos = await buscar(q);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="cc-mono text-2xl text-cc-ink">
        {q ? <>Resultados para “{q}”</> : "Buscar produtos"}
      </h1>
      <p className="mb-6 mt-1 text-sm text-cc-muted">
        {q ? `${produtos.length} produto(s) encontrado(s)` : "Digite algo na busca acima."}
      </p>
      <ProductGrid produtos={produtos} vazio="Tente outras palavras ou veja as categorias." />
    </div>
  );
}
