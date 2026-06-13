"use client";

import { useState } from "react";

// Mostra um cupom da plataforma com botão de copiar.
export default function CupomBox({ cupom }) {
  const [copiado, setCopiado] = useState(false);
  if (!cupom || !cupom.codigo) return null;

  function copiar() {
    try {
      navigator.clipboard.writeText(cupom.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* navegador sem suporte a clipboard */
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-2 border border-dashed border-cc-yellow-dark bg-[#FFF7E6] p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-cc-ink">
        <span className="font-bold">🎟️ Cupom:</span>{" "}
        {cupom.descricao || "desconto na plataforma"}
        {(cupom.minimo || cupom.validade) ? (
          <span className="block text-xs text-cc-muted">
            {cupom.minimo ? `compras a partir de R$${cupom.minimo}` : ""}
            {cupom.minimo && cupom.validade ? " · " : ""}
            {cupom.validade ? `válido até ${cupom.validade}` : ""}
          </span>
        ) : null}
      </div>
      <button
        onClick={copiar}
        className="flex items-center justify-center gap-2 border border-cc-ink bg-white px-4 py-2 text-sm font-bold text-cc-ink transition hover:bg-cc-cream active:translate-y-px"
      >
        <span className="cc-mono tracking-wider">{cupom.codigo}</span>
        <span className="text-xs font-semibold text-cc-muted">
          {copiado ? "copiado!" : "copiar"}
        </span>
      </button>
    </div>
  );
}
