import { supabase } from "@/lib/supabase";
import ListagemComFiltro from "@/components/ListagemComFiltro";
import { getTodasCategorias } from "@/lib/categorias";

export const revalidate = 300; // cache inteligente (ISR), atualiza a cada 5 min

export const metadata = {
  title: "Ofertas da Semana — Central da Compra",
};

const POR_PAGINA = 12;

async function getInicial() {
  const { data } = await supabase
    .from("produtos")
    .select("*")
    .neq("oculto", true)
    .eq("destaque", true)
    .order("criado_em", { ascending: false })
    .range(0, POR_PAGINA - 1);
  return data || [];
}

export default async function OfertasPage() {
  const [inicial, categorias] = await Promise.all([getInicial(), getTodasCategorias()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="cc-mono text-3xl text-cc-ink">
        Ofertas da <span className="text-br-green">Semana</span>
      </h1>
      <p className="mb-6 mt-1 text-sm text-cc-muted">Seleção atualizada toda semana</p>
      <ListagemComFiltro
        inicial={inicial}
        contexto={{ tipo: "ofertas" }}
        porPagina={POR_PAGINA}
        categorias={categorias}
      />
    </div>
  );
}
