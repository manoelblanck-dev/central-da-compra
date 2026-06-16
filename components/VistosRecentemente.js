"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { useCarrossel } from "@/lib/useCarrossel";

const KEY = "cc_vistos";
const MAX = 10;

// Guarda o id do produto visto na lista de "vistos recentemente" do
// navegador da pessoa (mais recente primeiro, sem repetir).
export function registrarVisto(id) {
  if (!id) return;
  try {
    const atual = JSON.parse(localStorage.getItem(KEY) || "[]");
    const novo = [id, ...atual.filter((x) => x !== id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(novo));
  } catch {
    /* ignora */
  }
}

// Mostra os últimos produtos vistos pela pessoa neste aparelho.
// `excluir`: id do produto atual, para não mostrar ele na própria lista.
export default function VistosRecentemente({ excluir }) {
  const [produtos, setProdutos] = useState(null); // null = ainda não verificou
  const trackRef = useRef(null);
  const { overflow, esquerda, direita, rolar } = useCarrossel(trackRef, produtos);

  useEffect(() => {
    let ids = [];
    try {
      ids = JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      ids = [];
    }
    if (excluir) ids = ids.filter((id) => id !== excluir);

    if (!ids.length) {
      setProdutos([]);
      return;
    }

    supabase
      .from("produtos")
      .select("*")
      .in("id", ids)
      .then(({ data }) => {
        const ordenados = ids
          .map((id) => (data || []).find((p) => p.id === id))
          .filter(Boolean);
        setProdutos(ordenados);
      });
  }, [excluir]);

  if (!produtos || produtos.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-cc-ink">
          Vistos <span className="serif-accent text-[1.15em]">recentemente</span>
        </h2>
        {overflow ? (
          <div className="flex gap-1.5">
            <button
              onClick={() => rolar(-1)}
              disabled={!esquerda}
              aria-label="Ver anteriores"
              className="grid h-9 w-9 place-items-center rounded-xl border border-cc-line bg-white text-lg text-cc-ink shadow-card transition hover:bg-cc-cream disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
            >
              ‹
            </button>
            <button
              onClick={() => rolar(1)}
              disabled={!direita}
              aria-label="Ver próximos"
              className="grid h-9 w-9 place-items-center rounded-xl border border-cc-line bg-white text-lg text-cc-ink shadow-card transition hover:bg-cc-cream disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
      <div ref={trackRef} className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-2">
        {produtos.map((p) => (
          <div key={p.id} className="w-[42%] shrink-0 sm:w-[200px]">
            <ProductCard produto={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
