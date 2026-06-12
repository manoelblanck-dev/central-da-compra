"use client";

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
  const economia = temDesconto
    ? formatarPreco(Number(produto.preco_antigo) - Number(produto.preco))
    : null;
  const ehCopa = produto.categoria === "selecao";

  return (
    <Link
      href={`/produto/${produto.id}`}
      className="group flex flex-col overflow-hidden border border-cc-line bg-white shadow-card transition hover:-translate-y-0.5 hover:border-cc-yellow"
    >
      <div className="relative aspect-square overflow-hidden bg-cc-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={produto.imagem_url || "/logo.png"}
          alt={produto.nome}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/logo.png";
          }}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {desconto ? (
          <span className="absolute left-2.5 top-2.5 bg-cc-ink px-2 py-0.5 text-[11px] font-bold text-white">
            -{desconto}%
          </span>
        ) : null}
        <span className="absolute right-2.5 top-2.5">
          <PlatformBadge plataforma={produto.plataforma} />
        </span>
        {ehCopa ? (
          <span className="absolute bottom-2.5 left-2.5 bg-br-green px-2 py-0.5 text-[11px] font-bold text-white">
            ⚽ Copa
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-cc-ink">
          {produto.nome}
        </h3>
        <div className="mt-auto pt-1">
          {preco ? (
            <>
              <div className="flex flex-wrap items-end gap-2">
                <span className="cc-mono text-[22px] leading-none text-cc-ink">{preco}</span>
                {precoAntigo && temDesconto ? (
                  <span className="text-sm font-semibold leading-none text-[#C0392B] line-through decoration-2">
                    {precoAntigo}
                  </span>
                ) : null}
              </div>
              {economia ? (
                <span className="mt-1.5 inline-block bg-[#E8F6EC] px-2 py-0.5 text-[11.5px] font-bold text-br-green">
                  Você economiza {economia}
                </span>
              ) : null}
            </>
          ) : (
            <span className="text-sm text-cc-muted">Ver oferta</span>
          )}
        </div>
      </div>
    </Link>
  );
}
