"use client";

import Link from "next/link";
import { useRef } from "react";
import { CATEGORIAS } from "@/lib/constantes";

function BandeiraBrasil() {
  return (
    <svg viewBox="0 0 28 20" width="24" height="17" aria-label="Bandeira do Brasil">
      <rect width="28" height="20" fill="#009739" />
      <polygon points="14,2.5 25.5,10 14,17.5 2.5,10" fill="#FEDD00" />
      <circle cx="14" cy="10" r="4.1" fill="#002776" />
    </svg>
  );
}

export default function CategoryCarousel() {
  const trackRef = useRef(null);

  function rola(dir) {
    const t = trackRef.current;
    if (t) t.scrollBy({ left: dir * Math.min(t.clientWidth * 0.8, 420), behavior: "smooth" });
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="cc-mono text-2xl text-cc-ink">Explore por categoria</h2>
        <div className="flex gap-1.5">
          <button
            onClick={() => rola(-1)}
            aria-label="Categorias anteriores"
            className="grid h-8 w-8 place-items-center border border-cc-line bg-white text-lg text-cc-ink transition hover:border-cc-yellow hover:bg-cc-cream"
          >
            ‹
          </button>
          <button
            onClick={() => rola(1)}
            aria-label="Próximas categorias"
            className="grid h-8 w-8 place-items-center border border-cc-line bg-white text-lg text-cc-ink transition hover:border-cc-yellow hover:bg-cc-cream"
          >
            ›
          </button>
        </div>
      </div>

      <div ref={trackRef} className="no-scrollbar flex gap-2.5 overflow-x-auto scroll-smooth pb-1">
        {CATEGORIAS.map((c) => {
          const copa = !!c.copa;
          const video = !!c.video;
          return (
            <Link
              key={c.slug}
              href={`/categoria/${c.slug}`}
              className={`flex w-[100px] shrink-0 flex-col items-center gap-1.5 border px-1.5 py-3 transition hover:-translate-y-0.5 ${
                copa
                  ? "border-br-green bg-[#F0FAF3]"
                  : video
                  ? "border-[#7A3FF2] bg-[#F4F0FF]"
                  : "border-cc-line bg-white hover:border-cc-yellow"
              }`}
            >
              <span
                className={`grid h-[34px] w-[34px] place-items-center text-lg ${
                  copa ? "bg-[#DBF3E3]" : video ? "bg-[#E7DDFD]" : "bg-cc-cream"
                }`}
              >
                {copa ? <BandeiraBrasil /> : c.emoji}
              </span>
              <span
                className={`text-center text-[11px] font-medium leading-tight ${
                  copa
                    ? "font-semibold text-br-green"
                    : video
                    ? "font-semibold text-[#5B27C4]"
                    : "text-cc-ink"
                }`}
              >
                {c.nome}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
