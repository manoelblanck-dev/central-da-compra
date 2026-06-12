import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CATEGORIAS } from "@/lib/constantes";
import ProductGrid from "@/components/ProductGrid";

// Sempre buscar dados frescos (produtos recém-cadastrados aparecem na hora).
export const dynamic = "force-dynamic";

async function getProdutos() {
  const { data: destaques } = await supabase
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

  return { destaques: destaques || [], recentes: recentes || [] };
}

export default async function Home() {
  const { destaques, recentes } = await getProdutos();

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="relative mt-5 overflow-hidden rounded-3xl border border-cc-line bg-cc-cream">
        <div
          aria-hidden
          className="cc-mono pointer-events-none absolute -right-6 -top-10 select-none text-[180px] leading-none text-cc-yellow/40 sm:text-[260px]"
        >
          CC
        </div>
        <div className="relative max-w-xl px-6 py-12 sm:px-10 sm:py-16">
          <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-cc-muted">
            Achados da Shopee, Mercado Livre e TikTok Shop
          </span>
          <h1 className="mt-4 cc-mono text-4xl leading-tight text-cc-ink sm:text-5xl">
            Os melhores achados,
            <br />
            num só lugar.
          </h1>
          <p className="mt-3 max-w-md text-cc-muted">
            A gente garimpa as ofertas, você só escolhe e compra. Direto na loja,
            com segurança.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORIAS.slice(0, 4).map((c) => (
              <Link
                key={c.slug}
                href={`/categoria/${c.slug}`}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-cc-ink transition hover:bg-cc-yellow"
              >
                {c.emoji} {c.nome}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Destaques */}
      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="cc-mono text-2xl text-cc-ink">Em destaque</h2>
          <span className="text-sm text-cc-muted">selecionados da semana</span>
        </div>
        <ProductGrid
          produtos={destaques}
          vazio="Marque produtos como “destaque” no painel admin para eles aparecerem aqui."
        />
      </section>

      {/* Recentes */}
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
