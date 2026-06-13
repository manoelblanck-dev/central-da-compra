"use client";

import Link from "next/link";
import { useRef } from "react";
import { CATEGORIAS } from "@/lib/constantes";

function BandeiraBrasil() {
  return (
    <svg viewBox="0 0 28 20" width="18" height="13" aria-label="Bandeira do Brasil">
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
        {CATEGORIAS.map((c) => {
          const copa = !!c.copa;
          const video = !!c.video;
          return (
            <Link
              key={c.slug}
              href={`/categoria/${c.slug}`}
              className={`flex shrink-0 items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-sm font-medium shadow-card transition hover:-translate-y-0.5 hover:shadow-cardlg ${
                copa
                  ? "border-br-green/30 bg-[#F2FBF5] text-br-green"
                  : video
                  ? "border-[#7A3FF2]/30 bg-[#F4F0FF] text-[#5B27C4]"
                  : "border-cc-line bg-white text-cc-ink"
              }`}
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-lg text-[15px] ${
                  copa ? "bg-[#DBF3E3]" : video ? "bg-[#E7DDFD]" : "bg-cc-cream"
                }`}
              >
                {copa ? <BandeiraBrasil /> : c.emoji}
              </span>
              <span className="whitespace-nowrap">{c.nome}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
