"use client";

import Link from "next/link";
import { useRef } from "react";
import { CATEGORIAS } from "@/lib/constantes";

function BandeiraBrasil() {
  return (
    <svg className="cc-bandeira" viewBox="0 0 28 20" width="18" height="13" aria-label="Bandeira do Brasil">
      <rect width="28" height="20" fill="#009739" />
      <polygon points="14,2.5 25.5,10 14,17.5 2.5,10" fill="#FEDD00" />
      <circle cx="14" cy="10" r="4.1" fill="#002776" />
    </svg>
  );
}

function IconeTodos() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

// Ordena as categorias em ordem alfabética (pt-BR, ignorando acentos/maiúsculas)
// e coloca "Todos" sempre como primeiro item (leva a todos os produtos).
function montarLista(base) {
  const ordenadas = [...base].sort((a, b) =>
    (a.nome || "").localeCompare(b.nome || "", "pt-BR", { sensitivity: "base" })
  );
  return [{ slug: "__todos", nome: "Todos", href: "/produtos", todos: true }, ...ordenadas];
}

export default function CategoryCarousel({ categorias = null }) {
  const trackRef = useRef(null);

  // Recebe a lista de categorias a exibir (já filtrada/montada pelo servidor —
  // inclui as criadas pelo usuário e esconde as vazias). Sem lista, usa as fixas.
  const base = categorias && categorias.length ? categorias : CATEGORIAS;
  if (base.length === 0) return null;
  const lista = montarLista(base); // "Todos" primeiro + restante em ordem alfabética

  function rola(dir) {
    const t = trackRef.current;
    if (t) t.scrollBy({ left: dir * Math.min(t.clientWidth * 0.8, 420), behavior: "smooth" });
  }

  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-cc-ink">
          Explore por <span className="serif-accent text-[1.15em]">categoria</span>
        </h2>
        <div className="flex gap-1.5">
          <button
            onClick={() => rola(-1)}
            aria-label="Categorias anteriores"
            className="grid h-9 w-9 place-items-center rounded-xl border border-cc-line bg-white text-lg text-cc-ink shadow-card transition hover:bg-cc-cream"
          >
            ‹
          </button>
          <button
            onClick={() => rola(1)}
            aria-label="Próximas categorias"
            className="grid h-9 w-9 place-items-center rounded-xl border border-cc-line bg-white text-lg text-cc-ink shadow-card transition hover:bg-cc-cream"
          >
            ›
          </button>
        </div>
      </div>

      <div ref={trackRef} className="no-scrollbar flex gap-2.5 overflow-x-auto scroll-smooth pb-1">
        {lista.map((c) => {
          const copa = !!c.copa;
          const video = !!c.video;
          const todos = !!c.todos;
          return (
            <Link
              key={c.slug}
              href={c.href || `/categoria/${c.slug}`}
              onClick={
                copa
                  ? (e) => {
                      // Easter egg: abre a Seleção com a "varredura Copa".
                      e.preventDefault();
                      window.dispatchEvent(
                        new CustomEvent("cc:varredura", {
                          detail: { href: c.href || `/categoria/${c.slug}` },
                        })
                      );
                    }
                  : undefined
              }
              className={`flex shrink-0 items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-sm font-medium shadow-card transition hover:-translate-y-0.5 hover:shadow-cardlg ${
                copa ? "cc-copa " : ""
              }${
                todos
                  ? "border-cc-ink bg-cc-ink text-white"
                  : copa
                  ? "border-br-green/30 bg-[#F2FBF5] text-br-green"
                  : video
                  ? "border-[#7A3FF2]/30 bg-[#F4F0FF] text-[#5B27C4]"
                  : "border-cc-line bg-white text-cc-ink"
              }`}
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-lg text-[15px] ${
                  todos ? "bg-white/15" : copa ? "bg-[#DBF3E3]" : video ? "bg-[#E7DDFD]" : "bg-cc-cream"
                }`}
              >
                {todos ? <IconeTodos /> : copa ? <BandeiraBrasil /> : c.emoji}
              </span>
              <span className="whitespace-nowrap">{c.nome}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
