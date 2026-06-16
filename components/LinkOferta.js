"use client";

import { rastrearLead } from "@/lib/pixel";

// Link "Ver Oferta" que leva ao redirecionamento de afiliado (/ir/[id])
// e dispara um evento de conversão nos pixels (Meta e TikTok), se instalados.
// `valor` (o preço do produto) vai junto no evento: assim a Meta/TikTok sabem
// que um clique num produto caro vale mais e otimizam melhor o anúncio.
// O evento também vai pelo servidor (CAPI), deduplicado — ver lib/pixel.js.
export default function LinkOferta({ id, valor, className, children }) {
  function aoClicar() {
    const v =
      valor === null || valor === undefined || valor === "" ? undefined : Number(valor);
    // "Lead" na Meta, "ClickButton" no TikTok — mesmo clique, nomes diferentes.
    rastrearLead({
      metaEvento: "Lead",
      ttqEvento: "ClickButton",
      meta: { content_ids: [id], content_type: "product", value: v, currency: "BRL" },
      tiktok: { content_id: String(id), value: v, currency: "BRL" },
    });
  }

  return (
    <a
      href={`/ir/${id}`}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      onClick={aoClicar}
      className={className}
    >
      {children}
    </a>
  );
}
