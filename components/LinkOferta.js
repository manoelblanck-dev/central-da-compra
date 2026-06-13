"use client";

// Link "Ver Oferta" que leva ao redirecionamento de afiliado (/ir/[id])
// e dispara um evento de conversão nos pixels (Meta e TikTok), se instalados.
export default function LinkOferta({ id, className, children }) {
  function aoClicar() {
    try {
      if (window.fbq) window.fbq("track", "Lead", { content_ids: [id] });
    } catch {
      /* pixel não instalado */
    }
    try {
      if (window.ttq) window.ttq.track("ClickButton", { content_id: id });
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
