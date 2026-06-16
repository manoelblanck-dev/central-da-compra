"use client";

import { useCallback, useEffect, useState } from "react";

// Motor de carrossel horizontal reutilizável.
// Detecta se há overflow (pra mostrar as setas só quando precisa) e a POSIÇÃO
// do scroll (pra desabilitar a seta da esquerda no começo e a da direita no fim
// — assim nunca dá pra rolar para um espaço vazio). Expõe a função `rolar`.
//
// `trackRef`: ref do contêiner com overflow-x. `dep`: muda quando a lista muda.
export function useCarrossel(trackRef, dep) {
  const [estado, setEstado] = useState({ overflow: false, esquerda: false, direita: false });

  const atualizar = useCallback(() => {
    const t = trackRef.current;
    if (!t) return;
    const overflow = t.scrollWidth - t.clientWidth > 8;
    const esquerda = t.scrollLeft > 4;
    const direita = t.scrollLeft < t.scrollWidth - t.clientWidth - 4;
    setEstado({ overflow, esquerda, direita });
  }, [trackRef]);

  useEffect(() => {
    atualizar();
    const t = trackRef.current;
    if (!t) return;
    t.addEventListener("scroll", atualizar, { passive: true });
    window.addEventListener("resize", atualizar);
    return () => {
      t.removeEventListener("scroll", atualizar);
      window.removeEventListener("resize", atualizar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atualizar, dep]);

  // Rola ~80% da largura visível (com teto), suavemente. O navegador já trava
  // o scroll nos limites, então não há como passar do conteúdo.
  const rolar = useCallback(
    (sentido, teto = 520) => {
      const t = trackRef.current;
      if (t) t.scrollBy({ left: sentido * Math.min(t.clientWidth * 0.8, teto), behavior: "smooth" });
    },
    [trackRef]
  );

  return { ...estado, rolar };
}
