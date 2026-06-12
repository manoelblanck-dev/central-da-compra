import Link from "next/link";
import PlatformBadge from "@/components/PlatformBadge";
import { formatarPreco } from "@/lib/constantes";

export default function ProductCard({ produto }) {
  const preco = formatarPreco(produto.preco);
  const precoAntigo = formatarPreco(produto.preco_antigo);
  const temDesconto =
    produto.preco_antigo && Number(produto.preco_antigo) > Number(produto.preco);
  const desconto = temDesconto
    ? Math.round((1 - Number(produto.preco) / Number(produto.preco_antigo)) * 100)
    : null;

  return (
    <Link
      href={`/produto/${produto.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-cc-line bg-white shadow-card transition hover:-translate-y-0.5 hover:border-cc-yellow"
    >
      <div className="relative aspect-square overflow-hidden bg-cc-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={produto.imagem_url || "https://placehold.co/600x600/FFF8EC/211C15?text=Produto"}
          alt={produto.nome}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {desconto ? (
          <span className="absolute left-2 top-2 rounded-full bg-cc-ink px-2 py-0.5 text-[11px] font-bold text-white">
            -{desconto}%
          </span>
        ) : null}
        <span className="absolute right-2 top-2">
          <PlatformBadge plataforma={produto.plataforma} />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-cc-ink">
          {produto.nome}
        </h3>
        <div className="mt-auto pt-1">
          {preco ? (
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-cc-ink">{preco}</span>
              {precoAntigo && temDesconto ? (
                <span className="text-xs text-cc-muted line-through">{precoAntigo}</span>
              ) : null}
            </div>
          ) : (
            <span className="text-sm text-cc-muted">Ver oferta</span>
          )}
        </div>
      </div>
    </Link>
  );
}
