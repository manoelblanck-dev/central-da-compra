"use client";

import LinkOferta from "@/components/LinkOferta";
import { formatarPreco } from "@/lib/constantes";

// Barra fixa na base da tela, SÓ no celular (some no desktop com md:hidden).
// Mantém o preço e o botão "Ver Oferta" sempre visíveis enquanto a pessoa
// rola a página — reduz o atrito de quem já está quase clicando em comprar.
// Usa o mesmo LinkOferta do botão principal: conta o clique e dispara os
// pixels de conversão da mesma forma.
export default function BarraComprarMobile({ id, preco, precoAntigo }) {
  const precoFmt = formatarPreco(preco);
  const precoAntigoFmt = formatarPreco(precoAntigo);
  const temDesconto = precoAntigo && Number(precoAntigo) > Number(preco);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cc-line bg-white/95 px-4 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <div className="min-w-0 flex-1">
          {precoFmt ? (
            <div className="flex items-baseline gap-2">
              <span className="cc-mono text-xl leading-none text-cc-ink">{precoFmt}</span>
              {precoAntigoFmt && temDesconto ? (
                <span className="text-xs font-semibold leading-none text-[#C0392B] line-through">
                  {precoAntigoFmt}
                </span>
              ) : null}
            </div>
          ) : (
            <span className="text-sm text-cc-muted">Ver preço na loja</span>
          )}
        </div>
        <LinkOferta
          id={id}
          className="shrink-0 rounded-xl bg-cc-ink px-6 py-3 text-center text-sm font-semibold text-white shadow-card transition active:translate-y-px"
        >
          Ver Oferta →
        </LinkOferta>
      </div>
    </div>
  );
}
