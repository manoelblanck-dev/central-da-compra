import { supabase } from "@/lib/supabase";
import ListagemComFiltro from "@/components/ListagemComFiltro";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Todos os produtos — Central da Compra",
};

const POR_PAGINA = 12;

async function getInicial() {
  const { data } = await supabase
    .from("produtos")
    .select("*")
    .order("criado_em", { ascending: false })
    .range(0, POR_PAGINA - 1);
  return data || [];
}

export default async function ProdutosPage() {
  const inicial = await getInicial();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 cc-mono text-3xl text-cc-ink">Todos os produtos</h1>
      <ListagemComFiltro
        inicial={inicial}
        contexto={{ tipo: "todos" }}
        porPagina={POR_PAGINA}
      />
    </div>
  );
}
