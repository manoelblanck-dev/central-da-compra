import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatarPreco, nomeCategoria } from "@/lib/constantes";
import PlatformBadge from "@/components/PlatformBadge";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

async function getProduto(id) {
  const { data } = await supabase.from("produtos").select("*").eq("id", id).single();
  return data;
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* migalhas */}
      <nav className="mb-4 text-sm text-cc-muted">
        <Link href="/" className="hover:text-cc-ink">Início</Link>
        <span className="mx-1.5">/</span>
        <Link href={`/categoria/${produto.categoria}`} className="hover:text-cc-ink">
          {nomeCategoria(produto.categoria)}
        </Link>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* imagem */}
        <div className="overflow-hidden border border-cc-line bg-cc-cream">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={produto.imagem_url || "https://placehold.co/800x800/FFF8EC/211C15?text=Produto"}
            alt={produto.nome}
            className="aspect-square w-full object-cover"
          />
        </div>

        {/* infos */}
        <div className="flex flex-col">
          <PlatformBadge plataforma={produto.plataforma} className="self-start" />
          <h1 className="mt-3 text-2xl font-semibold leading-snug text-cc-ink sm:text-3xl">
            {produto.nome}
          </h1>

          <div className="mt-4">
            <div className="flex flex-wrap items-end gap-3">
              {preco ? (
                <span className="cc-mono text-4xl leading-none text-cc-ink">{preco}</span>
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
          </div>

          {produto.descricao ? (
            <p className="mt-5 whitespace-pre-line leading-relaxed text-cc-muted">
              {produto.descricao}
            </p>
          ) : null}

          {/* CTA de compra → vai para a rota de redirecionamento /ir/[id] */}
          <a
            href={`/ir/${produto.id}`}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="mt-7 inline-flex items-center justify-center gap-2 bg-cc-yellow px-7 py-3.5 text-base font-bold text-cc-ink shadow-card transition hover:bg-cc-yellow-dark"
          >
            Ver oferta e comprar →
          </a>
          <p className="mt-3 text-xs text-cc-muted">
            Você será levado para a loja oficial da{" "}
            {produto.plataforma === "mercado_livre"
              ? "Mercado Livre"
              : produto.plataforma === "tiktok_shop"
              ? "TikTok Shop"
              : "Shopee"}{" "}
            para finalizar a compra com segurança.
          </p>
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
