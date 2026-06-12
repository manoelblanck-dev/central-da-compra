import { supabase } from "@/lib/supabase";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ofertas da Semana — Central da Compra",
};

async function getOfertas() {
  const { data } = await supabase
    .from("produtos")
    .select("*")
    .eq("destaque", true)
    .order("criado_em", { ascending: false })
    .limit(60);
  return data || [];
}

export default async function OfertasPage() {
  const ofertas = await getOfertas();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="cc-mono text-3xl text-cc-ink">
        Ofertas da <span className="text-br-green">Semana</span> ⚽
      </h1>
      <p className="mb-6 mt-1 text-sm text-cc-muted">
        {ofertas.length} oferta(s) selecionada(s) — atualizadas toda semana
      </p>
      <ProductGrid
        produtos={ofertas}
        vazio="Nenhuma oferta marcada como destaque ainda."
      />
    </div>
  );
}
