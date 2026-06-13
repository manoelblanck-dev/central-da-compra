"use client";

import { useState } from "react";

function nomePlat(id) {
  return id === "mercado_livre" ? "Mercado Livre" : id === "tiktok_shop" ? "TikTok Shop" : "Shopee";
}

function Ticket({ cupom }) {
  const [copiado, setCopiado] = useState(false);
  function copiar() {
    try {
      navigator.clipboard.writeText(cupom.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* navegador sem suporte */
    }
  }
  return (
    <button
      onClick={copiar}
      className="flex items-center gap-2 border border-cc-line bg-white px-3 py-2 text-left transition hover:border-cc-yellow active:translate-y-px"
      title="Copiar código"
    >
      <div className="leading-tight">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-cc-muted">
          {nomePlat(cupom.plataforma)}
        </div>
        <div className="cc-mono text-base tracking-wider text-cc-ink">{cupom.codigo}</div>
        {cupom.descricao ? (
          <div className="text-[11px] text-cc-muted">
            {cupom.descricao}
            {cupom.validade ? ` · até ${cupom.validade}` : ""}
          </div>
        ) : null}
      </div>
      <span className="ml-1 shrink-0 bg-cc-yellow px-2 py-1 text-[11px] font-bold text-cc-ink">
        {copiado ? "copiado!" : "copiar"}
      </span>
    </button>
  );
}

// Faixa de cupons mostrada na home. Recebe a lista vinda do servidor.
export default function CupomStrip({ cupons }) {
  if (!cupons || cupons.length === 0) return null;
  return (
    <section className="mt-3 border border-dashed border-cc-yellow-dark bg-[#FFF7E6] p-4">
      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className="font-bold text-cc-ink">🎟️ Cupons ativos</span>
        <span className="text-xs text-cc-muted">
          copie o código e use no carrinho da loja na hora de finalizar a compra
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {cupons.map((c, i) => (
          <Ticket key={i} cupom={c} />
        ))}
      </div>
    </section>
  );
}
