"use client";

import Image from "next/image";
import { useState } from "react";

// Imagem da página do produto, otimizada (next/image) e com fallback
// para a logo caso o link da foto esteja quebrado.
export default function ImagemProduto({ src, alt }) {
  const [atual, setAtual] = useState(src || "/logo.png");
  return (
    <div className="relative aspect-square w-full">
      <Image
        src={atual}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-contain"
        priority
        onError={() => setAtual("/logo.png")}
      />
    </div>
  );
}
