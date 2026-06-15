import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProductGrid from "@/components/ProductGrid";
import CategoryCarousel from "@/components/CategoryCarousel";
import ProximoJogo from "@/components/ProximoJogo";
import CupomStrip from "@/components/CupomStrip";
import VistosRecentemente from "@/components/VistosRecentemente";
import BotaoWhatsApp from "@/components/BotaoWhatsApp";
import OfertaDoDia from "@/components/OfertaDoDia";
import ProductCarousel from "@/components/ProductCarousel";
import FaixaConfianca from "@/components/FaixaConfianca";
import { getCategoriasComProdutos } from "@/lib/categoriasDisponiveis";
import { getTodasCategorias } from "@/lib/categorias";
import { IconEscudo, IconLojaOficial, IconRapido } from "@/components/IconesSelo";

// Cache inteligente (ISR): a página é servida do cache (rápida) e atualizada
// a cada 5 min. Quando você mexe em produtos/cupons no painel, a revalidação
// automática (lib/revalidar.js) atualiza na hora.
export const revalidate = 300;

async function getProdutos() {
  // As 3 consultas são independentes — roda em paralelo (mais rápido que em fila).
  const [{ data: ofertas }, { data: recentes }, { data: clicados }] = await Promise.all([
    supabase
      .from("produtos")
      .select("*")
      .eq("destaque", true)
      .order("criado_em", { ascending: false })
      .limit(8),
    supabase
      .from("produtos")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(12),
    // Mais clicados (usa o contador de cliques que já coletamos)
    supabase
      .from("produtos")
      .select("*")
      .gt("cliques", 0)
      .order("cliques", { ascending: false })
      .limit(8),
  ]);

  return {
    ofertas: ofertas || [],
    recentes: recentes || [],
    clicados: clicados || [],
  };
}

// "Oferta do dia": o produto mais clicado que tenha preço (pra o card ficar
// completo). Se ninguém clicou ainda, pega o mais recente com preço.
async function getOfertaDoDia() {
  const { data } = await supabase
    .from("produtos")
    .select("*")
    .not("preco", "is", null)
    .order("cliques", { ascending: false })
    .order("criado_em", { ascending: false })
    .limit(1);
  return data?.[0] || null;
}

// Total de produtos cadastrados (pra faixa de confiança). Só conta, não traz dados.
async function getTotalProdutos() {
  const { count } = await supabase
    .from("produtos")
    .select("*", { count: "exact", head: true });
  return count || 0;
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
  // Os blocos são independentes — busca tudo em paralelo.
  const [
    { ofertas, recentes, clicados },
    jogo,
    cupons,
    ofertaDoDia,
    totalProdutos,
    categoriasDisp,
    todasCategorias,
  ] = await Promise.all([
    getProdutos(),
    getProximoJogo(),
    getCupons(),
    getOfertaDoDia(),
    getTotalProdutos(),
    getCategoriasComProdutos(),
    getTodasCategorias(),
  ]);

  // Categorias a exibir no carrossel: as que têm produtos (fixas ou criadas).
  const categoriasParaMostrar = todasCategorias.filter((c) =>
    categoriasDisp.includes(c.slug)
  );

  // Catálogo pequeno: evita mostrar os mesmos produtos repetidos em 3 seções.
  // Mostra uma única seção "Ofertas" com tudo. Quando crescer, volta a separar
  // em "Ofertas da Semana", "Mais procurados" e "Novidades".
  const poucosProdutos = totalProdutos <= 8;

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
              <span className="inline-flex items-center gap-1.5">
                <IconEscudo className="h-4 w-4 text-br-green" />
                <b className="font-semibold text-cc-ink">Compra 100% segura</b>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconLojaOficial className="h-4 w-4 text-br-green" />
                <b className="font-semibold text-cc-ink">Direto na loja oficial</b>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconRapido className="h-4 w-4 text-br-green" />
                <b className="font-semibold text-cc-ink">Sem cadastro</b>
              </span>
            </div>
            <CupomStrip cupons={cupons} />
          </div>
        </div>
      </section>

      {/* Oferta do dia — produto mais clicado, com urgência (contagem regressiva) */}
      <OfertaDoDia produto={ofertaDoDia} />

      {/* Convite pro canal de ofertas no WhatsApp (só aparece com o link configurado) */}
      <BotaoWhatsApp variante="faixa" />

      {/* Vistos recentemente (só aparece se a pessoa já visitou algum produto) */}
      <VistosRecentemente />

      {/* Próximo jogo do Brasil (só aparece se houver jogo cadastrado) */}
      <ProximoJogo jogo={jogo} />

      {/* CATEGORIAS (carrossel) — só aparece se houver categorias com produtos */}
      {categoriasParaMostrar.length > 0 ? (
        <section className="mt-10">
          <CategoryCarousel categorias={categoriasParaMostrar} />
        </section>
      ) : null}

      {/* Faixa de confiança (números reais que reforçam credibilidade) */}
      <FaixaConfianca totalProdutos={totalProdutos} />

      {poucosProdutos ? (
        /* Catálogo pequeno: uma seção única, sem repetir os mesmos produtos */
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-cc-ink">
            Nossas <span className="serif-accent text-[1.15em]">ofertas</span>
          </h2>
          <ProductGrid
            produtos={recentes}
            vazio="Cadastre seu primeiro produto no painel admin para começar."
          />
        </section>
      ) : (
        <>
          {/* OFERTAS DA SEMANA (carrossel — setas só se ultrapassar a tela) */}
          <section className="mt-12">
            <ProductCarousel
              produtos={ofertas}
              titulo="Ofertas da"
              destaque="Semana"
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

          {/* MAIS CLICADOS (carrossel) — só com volume suficiente */}
          {clicados.length >= 4 ? (
            <section className="mt-14">
              <ProductCarousel produtos={clicados} titulo="Os mais" destaque="procurados" />
            </section>
          ) : null}

          {/* NOVIDADES */}
          <section className="mt-14">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight text-cc-ink">
              <span className="serif-accent text-[1.15em]">Novidades</span>
            </h2>
            <ProductGrid produtos={recentes} />
          </section>
        </>
      )}
    </div>
  );
}
