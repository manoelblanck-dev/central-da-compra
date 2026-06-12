import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProductGrid from "@/components/ProductGrid";
import CategoryCards from "@/components/CategoryCards";

// Sempre buscar dados frescos (produtos recém-cadastrados aparecem na hora).
export const dynamic = "force-dynamic";

async function getProdutos() {
  const { data: ofertas } = await supabase
    .from("produtos")
    .select("*")
    .eq("destaque", true)
    .order("criado_em", { ascending: false })
    .limit(8);

  const { data: recentes } = await supabase
    .from("produtos")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(12);

  return { ofertas: ofertas || [], recentes: recentes || [] };
}

export default async function Home() {
  const { ofertas, recentes } = await getProdutos();

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* OFERTAS DA SEMANA — primeira coisa que o visitante vê */}
      <section className="mt-6">
        <div className="flex items-center gap-4 border border-cc-line bg-cc-cream px-6 py-5">
          <span className="text-3xl" aria-hidden>⚽</span>
          <div>
            <h1 className="cc-mono text-3xl leading-tight text-cc-ink">
              Ofertas da <span className="text-br-green">Semana</span>
            </h1>
            <p className="mt-0.5 text-sm text-cc-muted">
              As melhores promoções da Shopee e Mercado Livre, garimpadas pra você —
              atualizadas toda semana.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <ProductGrid
            produtos={ofertas}
            vazio="Marque produtos como “destaque” no painel admin para eles aparecerem aqui."
          />
        </div>

        {ofertas.length > 0 ? (
          <div className="mt-5 text-center">
            <Link
              href="/ofertas"
              className="inline-block bg-cc-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
            >
              Ver todas as ofertas da semana →
            </Link>
          </div>
        ) : null}
      </section>

      {/* CATEGORIAS */}
      <section className="mt-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="cc-mono text-2xl text-cc-ink">Explore por categoria</h2>
          <span className="text-sm text-cc-muted">escolha e encontre rápido</span>
        </div>
        <CategoryCards />
      </section>

      {/* NOVIDADES */}
      <section className="mt-12">
        <h2 className="mb-4 cc-mono text-2xl text-cc-ink">Novidades</h2>
        <ProductGrid
          produtos={recentes}
          vazio="Cadastre seu primeiro produto no painel admin para começar."
        />
      </section>
    </div>
  );
}
