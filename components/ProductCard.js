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

  // Link de compartilhamento no WhatsApp (leva pra página do produto no site)
  const urlProduto = `${BASE}/produto/${produto.id}`;
  const msg = `Olha essa oferta na Central da Compra 👇\n${produto.nome}\n${urlProduto}`;
  const wpp = `https://wa.me/?text=${encodeURIComponent(msg)}`;

  return (
    <div className="group relative flex flex-col overflow-hidden border border-cc-line bg-white shadow-card transition hover:-translate-y-0.5 hover:border-cc-yellow">
      {/* favoritar (fica sobre a imagem, fora do link) */}
      <div className="absolute right-2.5 top-2.5 z-20">
        <BotaoFavorito id={produto.id} />
      </div>
      {/* imagem + título levam à página do produto */}
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
          {desconto ? (
            <span className="absolute left-2.5 top-2.5 bg-cc-ink px-2 py-0.5 text-[11px] font-bold text-white">
              -{desconto}%
            </span>
          ) : null}
          <span className="absolute bottom-2.5 right-2.5">
            <PlatformBadge plataforma={produto.plataforma} />
          </span>
          {ehCopa ? (
            <span className="absolute bottom-2.5 left-2.5 bg-br-green px-2 py-0.5 text-[11px] font-bold text-white">
              ⚽ Copa
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3">
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

      {/* ações: Ver Oferta (link de afiliado) + compartilhar no WhatsApp */}
      <div className="flex gap-2 p-3 pt-0">
        <LinkOferta
          id={produto.id}
          className="flex-1 bg-cc-yellow py-2.5 text-center text-sm font-bold text-cc-ink transition hover:bg-cc-yellow-dark active:translate-y-px"
        >
          Ver Oferta
        </LinkOferta>
        <a
          href={wpp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartilhar no WhatsApp"
          title="Compartilhar no WhatsApp"
          className="grid w-10 place-items-center bg-[#25D366] text-white transition hover:brightness-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15c-1.52 0-3.01-.41-4.3-1.18l-.31-.18-3.12.82.83-3.04-.2-.31a8.21 8.21 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.25-8.25 8.25zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
