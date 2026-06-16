import { supabase } from "@/lib/supabase";
import { sanitizarBusca } from "@/lib/constantes";
import BuscaAoVivo from "@/components/BuscaAoVivo";

export const dynamic = "force-dynamic";

const POR_PAGINA = 12;

// Primeira página de resultados, feita no servidor — assim a página abre já com
// conteúdo (rápida e indexável). Depois, a busca ao vivo assume no navegador.
async function buscar(q) {
  if (!q) return [];
  const { data, error } = await supabase.rpc("buscar_produtos", {
    termo: q,
    lim: POR_PAGINA,
    off: 0,
  });
  if (!error && data) return data;
  const seguro = sanitizarBusca(q);
  if (!seguro) return [];
  const { data: d2 } = await supabase
    .from("produtos")
    .select("*")
    .or(`nome.ilike.%${seguro}%,descricao.ilike.%${seguro}%`)
    .order("criado_em", { ascending: false })
    .range(0, POR_PAGINA - 1);
  return d2 || [];
}

export default async function BuscaPage({ searchParams }) {
  const q = (searchParams?.q || "").trim();
  const inicial = await buscar(q);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="cc-mono text-2xl text-cc-ink">Buscar produtos</h1>
      <p className="mb-6 mt-1 text-sm text-cc-muted">
        Digite e os resultados aparecem na hora.
      </p>
      <BuscaAoVivo termoInicial={q} inicial={inicial} />
    </div>
  );
}
