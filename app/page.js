import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProductGrid from "@/components/ProductGrid";
import CategoryCarousel from "@/components/CategoryCarousel";
import ProximoJogo from "@/components/ProximoJogo";
import CupomStrip from "@/components/CupomStrip";
import VistosRecentemente from "@/components/VistosRecentemente";

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

  // Mais clicados (usa o contador de cliques que já coletamos)
  const { data: clicados } = await supabase
    .from("produtos")
    .select("*")
    .gt("cliques", 0)
    .order("cliques", { ascending: false })
    .limit(8);

  return {
    ofertas: ofertas || [],
    recentes: recentes || [],
    clicados: clicados || [],
  };
}

async function getProximoJogo() {
  const { data } = await supabase
    .from("config")
    .select("valor")
    .eq("chave", "proximo_jogo")
    .maybeSingle();
  return data?.valor || null;
}

async function getCupons() {
  const { data } = await supabase
    .from("config")
    .select("valor")
    .eq("chave", "cupons")
    .maybeSingle();
  return Array.isArray(data?.valor) ? data.valor.filter((c) => c && c.codigo) : [];
}

export default async function Home() {
  const { ofertas, recentes, clicados } = await getProdutos();
  const jogo = await getProximoJogo();
  const cupons = await getCupons();

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* HERO emoldurado */}
      <section className="mt-3">
        <div className="relative overflow-hidden rounded-3xl border border-cc-line bg-[linear-gradient(135deg,#FFF6E6_0%,#FAF6EF_45%,#F3EEE5_100%)] px-6 py-10 sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,188,75,0.35),transparent_70%)]" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cc-line bg-white px-3 py-1.5 text-xs font-semibold text-br-green shadow-card">
              ⚽ Especial Copa do Mundo
            </span>
            <h1 className="mt-4 max-w-[16ch] text-3xl font-semibold leading-[1.05] tracking-tight text-cc-ink sm:text-5xl">
              As melhores ofertas, <span className="serif-accent">garimpadas pra você</span>
            </h1>
            <p className="mt-3 max-w-[48ch] text-sm text-cc-muted sm:text-base">
              Promoções selecionadas da Shopee e Mercado Livre, atualizadas toda semana.
              Você compra direto na loja oficial, com segurança.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1.5 text-[13px] text-cc-muted">
              <span>🔒 <b className="font-semibold text-cc-ink">Compra 100% segura</b></span>
              <span>✓ <b className="font-semibold text-cc-ink">Direto na loja oficial</b></span>
              <span>🙂 <b className="font-semibold text-cc-ink">Sem cadastro</b></span>
            </div>
            <CupomStrip cupons={cupons} />
          </div>
        </div>
      </section>

      {/* Vistos recentemente (só aparece se a pessoa já visitou algum produto) */}
      <VistosRecentemente />

      {/* Próximo jogo do Brasil (só aparece se houver jogo cadastrado) */}
      <ProximoJogo jogo={jogo} />

      {/* CATEGORIAS (carrossel) */}
      <section className="mt-10">
        <CategoryCarousel />
      </section>

      {/* OFERTAS DA SEMANA */}
      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-cc-ink">
            Ofertas da <span className="serif-accent text-[1.15em]">Semana</span>
          </h2>
        </div>
        <ProductGrid
          produtos={ofertas}
          vazio="Marque produtos como “destaque” no painel admin para eles aparecerem aqui."
        />
        {ofertas.length > 0 ? (
          <div className="mt-6 text-center">
            <Link
              href="/ofertas"
              className="inline-block rounded-xl bg-cc-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-black active:translate-y-px"
            >
              Ver todas as ofertas →
            </Link>
          </div>
        ) : null}
      </section>

      {/* MAIS CLICADOS */}
      {clicados.length > 0 ? (
        <section className="mt-14">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-cc-ink">
            🔥 Os mais <span className="serif-accent text-[1.15em]">clicados</span>
          </h2>
          <ProductGrid produtos={clicados} />
        </section>
      ) : null}

      {/* NOVIDADES */}
      <section className="mt-14">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-cc-ink">
          <span className="serif-accent text-[1.15em]">Novidades</span>
        </h2>
        <ProductGrid
          produtos={recentes}
          vazio="Cadastre seu primeiro produto no painel admin para começar."
        />
      </section>
    </div>
  );
}
