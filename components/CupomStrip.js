"use client";

import { useState } from "react";

function nomePlat(id) {
  return id === "mercado_livre" ? "Mercado Livre" : id === "tiktok_shop" ? "TikTok Shop" : "Shopee";
}

function detalhe(c) {
  const partes = [];
  if (c.descricao) partes.push(c.descricao);
  if (c.minimo) partes.push(`mín. R$${c.minimo}`);
  if (c.validade) partes.push(`até ${c.validade}`);
  return partes.join(" · ");
}

function Ticket({ cupom }) {
  const [copiado, setCopiado] = useState(false);
  function copiar() {
    try {
      navigator.clipboard.writeText(cupom.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* sem suporte */
    }
  }
  const d = detalhe(cupom);
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
        {d ? <div className="text-[11px] text-cc-muted">{d}</div> : null}
      </div>
      <span className="ml-1 shrink-0 bg-cc-yellow px-2 py-1 text-[11px] font-bold text-cc-ink">
        {copiado ? "copiado!" : "copiar"}
      </span>
    </button>
  );
}

// Botão discreto que abre/fecha a lista de cupons (fica fechado por padrão).
export default function CupomStrip({ cupons }) {
  const [aberto, setAberto] = useState(false);
  if (!cupons || cupons.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="inline-flex items-center gap-2 border border-dashed border-cc-yellow-dark bg-[#FFF7E6] px-4 py-2 text-sm font-semibold text-cc-ink transition hover:bg-[#FFF0D6]"
      >
        🎟️ {cupons.length} {cupons.length === 1 ? "cupom ativo" : "cupons ativos"}
        <span className={`text-xs transition-transform ${aberto ? "rotate-180" : ""}`}>▾</span>
      </button>

      {aberto ? (
        <div className="mt-2 border border-cc-line bg-white p-3">
          <p className="mb-2 text-xs text-cc-muted">
            Copie o código e use no carrinho da loja na hora de finalizar a compra.
          </p>
          <div className="flex flex-wrap gap-2">
            {cupons.map((c, i) => (
              <Ticket key={i} cupom={c} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
