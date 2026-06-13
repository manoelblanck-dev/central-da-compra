import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatarPreco, nomeCategoria } from "@/lib/constantes";
import PlatformBadge from "@/components/PlatformBadge";
import Estrelas from "@/components/Estrelas";
import ProductGrid from "@/components/ProductGrid";
import ImagemProduto from "@/components/ImagemProduto";
import LinkOferta from "@/components/LinkOferta";
import CupomBox from "@/components/CupomBox";
import BotaoFavorito from "@/components/BotaoFavorito";

export const dynamic = "force-dynamic";

async function getProduto(id) {
  const { data } = await supabase.from("produtos").select("*").eq("id", id).single();
  return data;
}

// Busca, no painel (config), um cupom ativo para a plataforma do produto
// que o produto realmente ALCANCE (respeita o valor mínimo de compra).
async function getCupomPlataforma(plataforma, preco) {
  const { data } = await supabase
    .from("config")
    .select("valor")
    .eq("chave", "cupons")
    .maybeSingle();
  const lista = Array.isArray(data?.valor) ? data.valor : [];
  const aplicaveis = lista.filter((c) => {
    if (!c || c.plataforma !== plataforma || !c.codigo) return false;
    const min = Number(c.minimo);
    if (!c.minimo || isNaN(min) || min <= 0) return true; // sem mínimo
    if (preco === null || preco === undefined || preco === "") return false; // produto sem preço: não arrisca
    return Number(preco) >= min; // só mostra se o produto alcança o mínimo
  });
  // entre os aplicáveis, prefere o de maior mínimo (normalmente o melhor desconto)
  aplicaveis.sort((a, b) => (Number(b.minimo) || 0) - (Number(a.minimo) || 0));
  return aplicaveis[0] || null;
}

export async function generateMetadata({ params }) {
  const produto = await getProduto(params.id);
  if (!produto) return { title: "Produto não encontrado — Central da Compra" };

  const preco = formatarPreco(produto.preco);
  const desc = produto.descricao
    ? produto.descricao.slice(0, 150)
    : `${produto.nome}${preco ? " por " + preco : ""} na Central da Compra.`;

  return {
    title: `${produto.nome} — Central da Compra`,
    description: desc,
    openGraph: {
      title: produto.nome,
      description: desc,
      type: "website",
      images: produto.imagem_url ? [{ url: produto.imagem_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: produto.nome,
      description: desc,
      images: produto.imagem_url ? [produto.imagem_url] : undefined,
    },
  };
}

async function getRelacionados(categoria, idAtual) {
  const { data } = await supabase
    .from("produtos")
    .select("*")
    .eq("categoria", categoria)
    .neq("id", idAtual)
    .limit(4);
  return data || [];
}

export default async function ProdutoPage({ params }) {
  const produto = await getProduto(params.id);
  if (!produto) notFound();

  const relacionados = await getRelacionados(produto.categoria, produto.id);
  const preco = formatarPreco(produto.preco);
  const precoAntigo = formatarPreco(produto.preco_antigo);
  const temDesconto =
    produto.preco_antigo && Number(produto.preco_antigo) > Number(produto.preco);

  const urlProduto = `https://centraldacompraonline.com.br/produto/${produto.id}`;
  const msgWpp = `Olha essa oferta na Central da Compra 👇\n${produto.nome}\n${urlProduto}`;
  const wpp = `https://wa.me/?text=${encodeURIComponent(msgWpp)}`;

  // cupom da plataforma deste produto (se houver cadastrado no painel)
  const cupom = await getCupomPlataforma(produto.plataforma, produto.preco);

  // Dados estruturados (Google pode exibir preço e estrelas no resultado)
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: produto.nome,
    description: produto.descricao || `${produto.nome} na Central da Compra.`,
    image: produto.imagem_url ? [produto.imagem_url] : undefined,
    category: nomeCategoria(produto.categoria),
  };
  if (produto.preco) {
    schema.offers = {
      "@type": "Offer",
      price: Number(produto.preco).toFixed(2),
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: urlProduto,
    };
  }
  if (produto.nota && produto.avaliacoes) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(produto.nota).toFixed(1),
      reviewCount: Math.max(1, Math.round(Number(produto.avaliacoes))),
    };
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* migalhas */}
      <nav className="mb-4 text-sm text-cc-muted">
        <Link href="/" className="hover:text-cc-ink">Início</Link>
        <span className="mx-1.5">/</span>
        <Link href={`/categoria/${produto.categoria}`} className="hover:text-cc-ink">
          {nomeCategoria(produto.categoria)}
        </Link>
      </nav>

      <div className="grid gap-6 md:grid-cols-2 md:items-start md:gap-10">
        {/* imagem — fixa no desktop, sem distorção, independente da descrição */}
        <div className="md:sticky md:top-28">
          <div className="overflow-hidden border border-cc-line bg-cc-cream">
            <ImagemProduto src={produto.imagem_url} alt={produto.nome} />
          </div>
        </div>

        {/* infos */}
        <div className="flex flex-col">
          <PlatformBadge plataforma={produto.plataforma} className="self-start" />
          <h1 className="mt-3 text-2xl font-semibold leading-snug text-cc-ink sm:text-3xl">
            {produto.nome}
          </h1>

          {(produto.nota || produto.cliques > 0) ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              {produto.nota ? <Estrelas nota={produto.nota} avaliacoes={produto.avaliacoes} /> : null}
              {produto.cliques > 5 ? (
                <span className="text-xs text-cc-muted">
                  👀 {produto.cliques} pessoas já viram esta oferta
                </span>
              ) : null}
            </div>
          ) : null}

          {/* preço */}
          <div className="mt-4">
            <div className="flex flex-wrap items-end gap-3">
              {preco ? (
                <span className="cc-mono text-3xl leading-none text-cc-ink sm:text-4xl">{preco}</span>
              ) : (
                <span className="text-lg text-cc-muted">Ver preço na loja</span>
              )}
              {precoAntigo && temDesconto ? (
                <span className="text-lg font-semibold leading-none text-[#C0392B] line-through decoration-2">
                  {precoAntigo}
                </span>
              ) : null}
            </div>
            {temDesconto ? (
              <span className="mt-2 inline-block bg-[#E8F6EC] px-2.5 py-1 text-xs font-bold text-br-green">
                Você economiza {formatarPreco(Number(produto.preco_antigo) - Number(produto.preco))}
              </span>
            ) : null}
            <p className="mt-2 text-xs text-cc-muted">
              💡 O preço pode mudar na loja — confira o valor atual na página oficial antes de comprar.
            </p>
          </div>

          {/* CTA: Ver Oferta + compartilhar no WhatsApp */}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <LinkOferta
              id={produto.id}
              className="flex items-center justify-center gap-2 bg-cc-yellow px-8 py-4 text-base font-bold text-cc-ink shadow-card transition hover:bg-cc-yellow-dark active:translate-y-px"
            >
              Ver Oferta →
            </LinkOferta>
            <a
              href={wpp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] px-5 py-4 text-sm font-semibold text-white transition hover:brightness-95"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15c-1.52 0-3.01-.41-4.3-1.18l-.31-.18-3.12.82.83-3.04-.2-.31a8.21 8.21 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.25-8.25 8.25zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/>
              </svg>
              Compartilhar
            </a>
            <BotaoFavorito id={produto.id} variante="linha" />
          </div>

          {/* cupom da plataforma (se houver) */}
          <CupomBox cupom={cupom} />

          {/* selos de confiança */}
          <div className="mt-4 grid gap-2 border border-cc-line bg-cc-cream/50 p-3 text-xs text-cc-ink sm:grid-cols-3">
            <span className="flex items-center gap-1.5">
              <span aria-hidden>✓</span> Redirecionado para a loja oficial
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden>🔒</span> Compra segura na{" "}
              {produto.plataforma === "mercado_livre"
                ? "Mercado Livre"
                : produto.plataforma === "tiktok_shop"
                ? "TikTok Shop"
                : "Shopee"}
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden>🙂</span> Sem cadastro
            </span>
          </div>

          {/* descrição — abaixo do botão, pode ser longa sem atrapalhar */}
          {produto.descricao ? (
            <div className="mt-6 border-t border-cc-line pt-5">
              <h2 className="mb-2 text-sm font-semibold text-cc-ink">Descrição</h2>
              <p className="whitespace-pre-line leading-relaxed text-cc-muted">
                {produto.descricao}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* relacionados */}
      {relacionados.length > 0 ? (
        <section className="mt-14">
          <h2 className="mb-4 cc-mono text-2xl text-cc-ink">Ofertas parecidas</h2>
          <ProductGrid produtos={relacionados} />
        </section>
      ) : null}
    </div>
  );
}
