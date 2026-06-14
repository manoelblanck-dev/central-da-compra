"use client";

import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

export default function ProductGrid({ produtos, vazio }) {
  if (!produtos || produtos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-cc-line bg-cc-cream/50 px-6 py-16 text-center">
        <p className="cc-mono text-2xl text-cc-ink">Nada por aqui ainda</p>
        <p className="mt-2 text-sm text-cc-muted">
          {vazio || "Em breve novos achados nesta seção."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
      {produtos.map((p, i) => (
        <Reveal key={p.id} delay={(i % 4) * 80}>
          <ProductCard produto={p} />
        </Reveal>
      ))}
    </div>
  );
}
