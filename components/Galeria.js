"use client";

import Image from "next/image";
import { useState } from "react";

// Galeria de fotos do produto: imagem principal grande + miniaturas
// clicáveis. Com uma foto só, funciona como antes (sem miniaturas).
// Junta a imagem principal (imagem_url) com as extras (imagens).
export default function Galeria({ principal, imagens = [], alt }) {
  const lista = [principal, ...(Array.isArray(imagens) ? imagens : [])]
    .map((u) => (u || "").toString().trim())
    .filter(Boolean);
  const fotos = lista.length ? [...new Set(lista)] : ["/logo.png"];

  const [ativa, setAtiva] = useState(fotos[0]);
  const [erro, setErro] = useState(false);

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-cc-line bg-cc-cream">
        <div className="relative aspect-square w-full">
          <Image
            src={erro ? "/logo.png" : ativa}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            priority
            onError={() => setErro(true)}
          />
        </div>
      </div>

      {fotos.length > 1 ? (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {fotos.map((foto) => (
            <button
              key={foto}
              type="button"
              onClick={() => {
                setErro(false);
                setAtiva(foto);
              }}
              aria-label="Ver foto"
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-cc-cream transition ${
                ativa === foto ? "border-cc-ink ring-2 ring-cc-ink/10" : "border-cc-line hover:border-cc-ink/40"
              }`}
            >
              <Image src={foto} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
