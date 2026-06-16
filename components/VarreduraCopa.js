"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// "Varredura Copa": ao clicar na categoria Seleção, uma faixa verde→amarela
// cruza a tela na diagonal (cobre) e segue revelando a página nova.
// Fica montado uma vez no layout e escuta o evento "cc:varredura".
export default function VarreduraCopa() {
  const router = useRouter();
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    function handler(e) {
      const href = e?.detail?.href;
      if (!href) return;

      // Acessibilidade: quem pediu menos animação vai direto, sem efeito.
      const reduz = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (reduz) {
        router.push(href);
        return;
      }

      setAtivo(true);
      // Troca de página quando a faixa cobre a tela (meio da animação)...
      window.setTimeout(() => router.push(href), 360);
      // ...e some quando a faixa termina de passar (revela a página nova).
      window.setTimeout(() => setAtivo(false), 800);
    }

    window.addEventListener("cc:varredura", handler);
    return () => window.removeEventListener("cc:varredura", handler);
  }, [router]);

  if (!ativo) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden" aria-hidden="true">
      <div
        className="cc-varredura absolute left-0 top-[-10%] h-[120%] w-[170vw]"
        style={{
          background:
            "linear-gradient(100deg, #009739 0%, #009739 46%, #FEDD00 54%, #FEDD00 100%)",
        }}
      />
    </div>
  );
}
