import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CATEGORIAS, nomeCategoria } from "@/lib/constantes";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

async function getProdutos(slug) {
  const { data } = await supabase
    .from("produtos")
    .select("*")
    .eq("categoria", slug)
    .order("criado_em", { ascending: false })
    .limit(60);
  return data || [];
}

export default async function CategoriaPage({ params }) {
  const slug = params.slug;
  const existe = CATEGORIAS.some((c) => c.slug === slug);
  if (!existe) notFound();

  const produtos = await getProdutos(slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="cc-mono text-3xl text-cc-ink">{nomeCategoria(slug)}</h1>
      <p className="mb-6 mt-1 text-sm text-cc-muted">
        {produtos.length} produto(s) nesta categoria
      </p>
      <ProductGrid produtos={produtos} />
    </div>
  );
}
