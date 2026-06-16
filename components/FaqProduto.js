"use client";

import { useState } from "react";

// Mini-FAQ da página de produto: perguntas curtas que abrem ao clicar.
// Responde a principal objeção de quem não conhece a loja (segurança/cadastro).
export default function FaqProduto({ itens = [] }) {
  const [aberto, setAberto] = useState(null);
  if (!itens.length) return null;

  return (
    <section className="mt-6 border-t border-cc-line pt-5">
      <h2 className="mb-3 text-sm font-semibold text-cc-ink">Perguntas rápidas</h2>
      <div className="divide-y divide-cc-line overflow-hidden rounded-2xl border border-cc-line">
        {itens.map((f, i) => {
          const open = aberto === i;
          return (
            <div key={i}>
              <button
                type="button"
                onClick={() => setAberto(open ? null : i)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-cc-ink transition hover:bg-cc-cream/50"
              >
                {f.q}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                  className={`shrink-0 text-cc-muted transition-transform ${open ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {open ? (
                <p className="px-4 pb-3.5 text-sm leading-relaxed text-cc-muted">{f.a}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
