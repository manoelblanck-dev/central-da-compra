import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CATEGORIAS, nomeCategoria } from "@/lib/constantes";
import ListaProdutos from "@/components/ListaProdutos";

export const dynamic = "force-dynamic";

const POR_PAGINA = 12;

async function getInicial(slug) {
  const { data } = await supabase
    .from("produtos")
    .select("*")
    .eq("categoria", slug)
    .order("criado_em", { ascending: false })
    .range(0, POR_PAGINA - 1);
  return data || [];
}

export default async function CategoriaPage({ params }) {
  const slug = params.slug;
  if (!CATEGORIAS.some((c) => c.slug === slug)) notFound();

  const inicial = await getInicial(slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="cc-mono text-3xl text-cc-ink">{nomeCategoria(slug)}</h1>
      <p className="mb-6 mt-1 text-sm text-cc-muted">Confira os produtos desta categoria</p>
      <ListaProdutos
        inicial={inicial}
        tipo="categoria"
        params={{ slug }}
        porPagina={POR_PAGINA}
      />
    </div>
  );
}
