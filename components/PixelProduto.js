"use client";

import { useEffect } from "react";
import { rastrearEvento } from "@/lib/pixel";

// Componente invisível: ao abrir a página de um produto, dispara o evento
// "ViewContent" nos pixels (se a pessoa aceitou os cookies). Isso alimenta o
// topo do funil — a Meta/TikTok aprendem quem se interessa pelos produtos e
// conseguem montar públicos de remarketing.
export default function PixelProduto({ id, nome, preco, categoria }) {
  useEffect(() => {
    const valor =
      preco === null || preco === undefined || preco === "" ? undefined : Number(preco);

    rastrearEvento("ViewContent", {
      meta: {
        content_ids: [id],
        content_type: "product",
        content_name: nome,
        content_category: categoria,
        value: valor,
        currency: "BRL",
      },
      tiktok: {
        content_id: String(id),
        content_type: "product",
        content_name: nome,
        value: valor,
        currency: "BRL",
      },
    });
  }, [id, nome, preco, categoria]);

  return null;
}
