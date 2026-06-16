"use client";

// Link "Ver Oferta" que leva ao redirecionamento de afiliado (/ir/[id])
// e dispara um evento de conversão nos pixels (Meta e TikTok), se instalados.
// `valor` (o preço do produto) vai junto no evento: assim a Meta/TikTok sabem
// que um clique num produto caro vale mais e otimizam melhor o anúncio.
export default function LinkOferta({ id, valor, className, children }) {
  function aoClicar() {
    const v =
      valor === null || valor === undefined || valor === "" ? undefined : Number(valor);
    try {
      if (window.fbq)
        window.fbq("track", "Lead", {
          content_ids: [id],
          content_type: "product",
          value: v,
          currency: "BRL",
        });
    } catch {
      /* pixel não instalado */
    }
    try {
      if (window.ttq)
        window.ttq.track("ClickButton", { content_id: id, value: v, currency: "BRL" });
    } catch {
      /* pixel não instalado */
    }
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
