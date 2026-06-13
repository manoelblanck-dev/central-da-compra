"use client";

import { useEffect, useState } from "react";

// Recebe `alvo` = timestamp (ms) do jogo. Mostra a contagem ao vivo.
// Só começa a renderizar depois de montar, para evitar diferença
// entre o que o servidor gera e o que o navegador mostra (hidratação).
export default function Countdown({ alvo }) {
  const [agora, setAgora] = useState(null);

  useEffect(() => {
    setAgora(Date.now());
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (agora === null) return <span className="font-mono font-semibold">…</span>;

  let diff = alvo - agora;
  if (diff <= 0) return <span className="font-bold">é agora! 🎉</span>;

  const dias = Math.floor(diff / 86400000);
  diff -= dias * 86400000;
  const horas = Math.floor(diff / 3600000);
  diff -= horas * 3600000;
  const min = Math.floor(diff / 60000);
  diff -= min * 60000;
  const seg = Math.floor(diff / 1000);

  const p = (x) => String(x).padStart(2, "0");

  return (
    <span className="font-mono font-semibold tabular-nums">
      {dias > 0 ? `${dias}d ` : ""}
      {p(horas)}h {p(min)}m {p(seg)}s
    </span>
  );
}
