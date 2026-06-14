"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import PlatformBadge from "@/components/PlatformBadge";
import Estrelas from "@/components/Estrelas";
import BotaoFavorito from "@/components/BotaoFavorito";
import LinkOferta from "@/components/LinkOferta";
import { formatarPreco } from "@/lib/constantes";

const BASE = "https://centraldacompraonline.com.br";

export default function ProductCard({ produto }) {
  const [imgSrc, setImgSrc] = useState(produto.imagem_url || "/logo.png");
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
  const ehPopular = Number(produto.cliques) >= 20;

  const urlProduto = `${BASE}/produto/${produto.id}`;
  const msg = `Olha essa oferta na Central da Compra 👇\n${produto.nome}\n${urlProduto}`;
  const wpp = `https://wa.me/?text=${encodeURIComponent(msg)}`;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-cc-line bg-white shadow-card transition duration-200 hover:-translate-y-[3px] hover:shadow-cardlg">
      {/* favoritar (sobre a imagem, fora do link) */}
      <div className="absolute right-2.5 top-2.5 z-20">
        <BotaoFavorito id={produto.id} />
      </div>

      <Link href={`/produto/${produto.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden bg-cc-cream">
          <Image
            src={imgSrc}
            alt={produto.nome}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
            onError={() => setImgSrc("/logo.png")}
          />
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {desconto ? (
              <span className="rounded-full bg-cc-ink/85 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                -{desconto}%
              </span>
            ) : null}
            {ehPopular ? (
              <span className="rounded-full bg-cc-yellow px-2.5 py-1 text-[11px] font-semibold text-cc-ink backdrop-blur">
                Mais procurado
              </span>
            ) : null}
          </div>
          <span className="absolute bottom-3 right-3">
            <PlatformBadge plataforma={produto.plataforma} />
          </span>
          {ehCopa ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-br-green/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              ⚽ Copa
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-cc-ink">
            {produto.nome}
          </h3>
          {produto.nota ? <Estrelas nota={produto.nota} avaliacoes={produto.avaliacoes} /> : null}
          <div className="mt-auto pt-1">
            {preco ? (
              <>
                <div className="flex flex-wrap items-end gap-2">
                  <span className="cc-mono text-[22px] leading-none text-cc-ink">{preco}</span>
                  {precoAntigo && temDesconto ? (
                    <span className="text-sm font-medium leading-none text-[#C0392B] line-through">
                      {precoAntigo}
                    </span>
                  ) : null}
                </div>
                {economia ? (
                  <span className="mt-2 inline-block rounded-full bg-[#EAF7EE] px-2.5 py-0.5 text-[11.5px] font-semibold text-br-green">
                    economiza {economia}
                  </span>
                ) : null}
              </>
            ) : (
              <span className="text-sm text-cc-muted">Ver oferta</span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex gap-2 p-4 pt-0">
        <LinkOferta
          id={produto.id}
          className="flex-1 rounded-xl bg-cc-ink py-3 text-center text-sm font-semibold text-white transition hover:bg-black active:translate-y-px"
        >
          Ver Oferta
        </LinkOferta>
        <a
          href={wpp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartilhar no WhatsApp"
          title="Compartilhar no WhatsApp"
          className="grid w-11 place-items-center rounded-xl border border-cc-line bg-white text-[#25A35A] transition hover:bg-[#F2FBF5]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15c-1.52 0-3.01-.41-4.3-1.18l-.31-.18-3.12.82.83-3.04-.2-.31a8.21 8.21 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.25-8.25 8.25zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
