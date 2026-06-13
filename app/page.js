import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProductGrid from "@/components/ProductGrid";
import CategoryCarousel from "@/components/CategoryCarousel";

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
      {/* Banner Ofertas da Semana */}
      <section className="mt-6">
        <div className="flex items-center gap-3 border border-cc-line bg-cc-cream px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
          <span className="text-2xl sm:text-3xl" aria-hidden>⚽</span>
          <div>
            <h1 className="cc-mono text-2xl leading-tight text-cc-ink sm:text-3xl">
              Ofertas da <span className="text-br-green">Semana</span>
            </h1>
            <p className="mt-0.5 text-sm text-cc-muted">
              As melhores promoções da Shopee e Mercado Livre, garimpadas pra você —
              atualizadas toda semana.
            </p>
          </div>
        </div>
      </section>

      {/* faixa de confiança discreta */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 border border-cc-line bg-white px-4 py-2.5 text-center text-xs text-cc-muted">
        <span>🔒 Compra 100% segura</span>
        <span>✓ Direto na loja oficial</span>
        <span>🙂 Sem cadastro, sem complicação</span>
      </div>

      {/* CATEGORIAS (carrossel) — em cima dos produtos */}
      <section className="mt-8">
        <CategoryCarousel />
      </section>

      {/* PRODUTOS em destaque da semana */}
      <section className="mt-10">
        <ProductGrid
          produtos={ofertas}
          vazio="Marque produtos como “destaque” no painel admin para eles aparecerem aqui."
        />
        {ofertas.length > 0 ? (
          <div className="mt-5 text-center">
            <Link
              href="/ofertas"
              className="inline-block bg-cc-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-black active:translate-y-px"
            >
              Ver todas as ofertas da semana →
            </Link>
          </div>
        ) : null}
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
