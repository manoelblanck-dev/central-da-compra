"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// O site é uma SPA: ao clicar nos links, o Next troca de página SEM recarregar.
// O script do pixel (components/Pixels.js) só dispara o PageView do carregamento
// inicial — então, sem isso aqui, a Meta/TikTok enxergam só 1 página por visita.
// Este componente reenvia o PageView a cada troca de rota (a 1ª é pulada, pois o
// script inicial já a contou). Só roda dentro do consentimento aceito, e as
// chamadas são protegidas: se o pixel não existir, simplesmente não faz nada.
export default function PixelPageView() {
  const pathname = usePathname();
  const primeira = useRef(true);

  useEffect(() => {
    // A primeira renderização (carregamento da página) já foi contada pelo
    // script do pixel — aqui contamos só as navegações seguintes.
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    try {
      if (window.fbq) window.fbq("track", "PageView");
    } catch {
      /* pixel da Meta não instalado */
    }
    try {
      if (window.ttq) window.ttq.page();
    } catch {
      /* pixel do TikTok não instalado */
    }
  }, [pathname]);

  return null;
}
