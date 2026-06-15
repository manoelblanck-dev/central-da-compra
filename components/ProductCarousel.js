"use client";

import { useEffect, useRef, useState } from "react";
import ProductCard from "@/components/ProductCard";
import ProductGrid from "@/components/ProductGrid";

// Carrossel horizontal de produtos com setas de navegação.
// As setas só aparecem quando os produtos REALMENTE ultrapassam a largura
// disponível (detecção automática) — então 2-3 produtos que cabem na tela
// não mostram seta à toa. Reaproveitado em várias seções da home.
//
// titulo + destaque montam o cabeçalho: "{titulo} {destaque em itálico}".
export default function ProductCarousel({ produtos, titulo = "", destaque = "", vazio }) {
  const trackRef = useRef(null);
  const [temOverflow, setTemOverflow] = useState(false);

  const temProdutos = Array.isArray(produtos) && produtos.length > 0;

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    const checar = () => setTemOverflow(t.scrollWidth - t.clientWidth > 8);
    checar();
    window.addEventListener("resize", checar);
    return () => window.removeEventListener("resize", checar);
  }, [produtos]);

  function rola(dir) {
    const t = trackRef.current;
    if (t) t.scrollBy({ left: dir * Math.min(t.clientWidth * 0.8, 520), behavior: "smooth" });
  }

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight text-cc-ink">
          {titulo ? `${titulo} ` : ""}
          {destaque ? <span className="serif-accent text-[1.15em]">{destaque}</span> : null}
        </h2>
        {temProdutos && temOverflow ? (
          <div className="flex shrink-0 gap-1.5">
            <button
              onClick={() => rola(-1)}
              aria-label="Ver anteriores"
              className="grid h-9 w-9 place-items-center rounded-xl border border-cc-line bg-white text-lg text-cc-ink shadow-card transition hover:bg-cc-cream"
            >
              ‹
            </button>
            <button
              onClick={() => rola(1)}
              aria-label="Ver próximos"
              className="grid h-9 w-9 place-items-center rounded-xl border border-cc-line bg-white text-lg text-cc-ink shadow-card transition hover:bg-cc-cream"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>

      {temProdutos ? (
        <div ref={trackRef} className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-2 sm:gap-5">
          {produtos.map((p) => (
            <div key={p.id} className="w-[44%] shrink-0 sm:w-[210px] lg:w-[225px]">
              <ProductCard produto={p} />
            </div>
          ))}
        </div>
      ) : (
        <ProductGrid produtos={[]} vazio={vazio} />
      )}
    </div>
  );
}
