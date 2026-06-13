"use client";

import { useEffect, useState } from "react";

const KEY = "cc_favoritos";

function lerFavs() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

// Botão de coração que salva o produto nos favoritos (no navegador da pessoa).
// `variante`: "card" (sobre a imagem) ou "linha" (botão com texto).
export default function BotaoFavorito({ id, variante = "card" }) {
  const [fav, setFav] = useState(false);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    setFav(lerFavs().includes(id));
    const aoMudar = () => setFav(lerFavs().includes(id));
    window.addEventListener("cc-favoritos", aoMudar);
    return () => window.removeEventListener("cc-favoritos", aoMudar);
  }, [id]);

  function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    const atual = lerFavs();
    const novo = atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id];
    try {
      localStorage.setItem(KEY, JSON.stringify(novo));
    } catch {
      /* ignora */
    }
    setFav(novo.includes(id));
    window.dispatchEvent(new Event("cc-favoritos"));
  }

  const ativo = montado && fav;

  const Coracao = (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"
      fill={ativo ? "#E0245E" : "none"} stroke={ativo ? "#E0245E" : "currentColor"} strokeWidth="2">
      <path d="M12 21s-7.5-4.6-10-9.2C.6 9 1.6 5.5 4.8 4.8 7 4.3 9 5.5 12 8.5c3-3 5-4.2 7.2-3.7 3.2.7 4.2 4.2 2.8 7C19.5 16.4 12 21 12 21z" />
    </svg>
  );

  if (variante === "linha") {
    return (
      <button
        onClick={toggle}
        aria-label={ativo ? "Remover dos favoritos" : "Salvar nos favoritos"}
        className="flex items-center justify-center gap-2 border border-cc-line px-4 py-4 text-sm font-semibold text-cc-ink transition hover:bg-cc-cream active:translate-y-px"
      >
        {Coracao}
        {ativo ? "Salvo" : "Salvar"}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={ativo ? "Remover dos favoritos" : "Salvar nos favoritos"}
      className="grid h-8 w-8 place-items-center bg-white/90 text-cc-muted shadow-card backdrop-blur transition hover:bg-white"
    >
      {Coracao}
    </button>
  );
}
