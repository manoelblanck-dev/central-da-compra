import { supabase } from "@/lib/supabase";
import ListaProdutos from "@/components/ListaProdutos";

export const dynamic = "force-dynamic";

const POR_PAGINA = 12;

async function buscar(q) {
  if (!q) return [];
  const { data, error } = await supabase.rpc("buscar_produtos", {
    termo: q,
    lim: POR_PAGINA,
    off: 0,
  });
  if (!error && data) return data;
  // Fallback: busca simples se a função ainda não existir no banco
  const { data: d2 } = await supabase
    .from("produtos")
    .select("*")
    .or(`nome.ilike.%${q}%,descricao.ilike.%${q}%`)
    .order("criado_em", { ascending: false })
    .range(0, POR_PAGINA - 1);
  return d2 || [];
}

export default async function BuscaPage({ searchParams }) {
  const q = (searchParams?.q || "").trim();
  const inicial = await buscar(q);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="cc-mono text-2xl text-cc-ink">
        {q ? <>Resultados para “{q}”</> : "Buscar produtos"}
      </h1>
      <p className="mb-6 mt-1 text-sm text-cc-muted">
        {q ? "Veja o que encontramos pra você" : "Digite algo na busca acima."}
      </p>
      <ListaProdutos
        inicial={inicial}
        tipo="busca"
        params={{ q }}
        porPagina={POR_PAGINA}
        vazio="Tente outras palavras ou veja as categorias."
      />
    </div>
  );
}
