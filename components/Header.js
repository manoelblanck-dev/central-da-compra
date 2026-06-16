"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Formato de UUID válido — ignora "lixo" de versões antigas no contador.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function Header() {
  const router = useRouter();
  const [termo, setTermo] = useState("");
  const [favs, setFavs] = useState(0);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    // Se a página abriu direto numa URL de busca, já preenche o campo do topo.
    try {
      if (window.location.pathname === "/busca") {
        const q = new URLSearchParams(window.location.search).get("q");
        if (q) setTermo(q);
      }
    } catch {
      /* ignora */
    }
    const ler = () => {
      try {
        const v = JSON.parse(localStorage.getItem("cc_favoritos") || "[]");
        const lista = Array.isArray(v) ? v : [];
        // Conta só ids válidos; se achou lixo (versão antiga), conserta a lista.
        const validos = lista.filter((id) => typeof id === "string" && UUID.test(id));
        if (validos.length !== lista.length) {
          localStorage.setItem("cc_favoritos", JSON.stringify(validos));
        }
        setFavs(validos.length);
      } catch {
        setFavs(0);
      }
    };
    ler();
    window.addEventListener("cc-favoritos", ler);
    window.addEventListener("storage", ler);
    return () => {
      window.removeEventListener("cc-favoritos", ler);
      window.removeEventListener("storage", ler);
    };
  }, []);

  // Busca AO VIVO: enquanto a pessoa digita no campo do topo, os resultados se
  // atualizam (com um pequeno atraso pra não pesar). Funciona em PC e celular,
  // e usa só ESTA caixa (sem campo extra na página de resultados).
  const primeiroLive = useRef(true);
  useEffect(() => {
    // Não dispara na montagem (só quando a pessoa realmente digita).
    if (primeiroLive.current) {
      primeiroLive.current = false;
      return;
    }
    const q = termo.trim();
    const t = setTimeout(() => {
      const destino = q ? `/busca?q=${encodeURIComponent(q)}` : "/busca";
      const atual = window.location.pathname + window.location.search;
      if (destino === atual) return; // já estamos exibindo esse termo
      if (q) {
        // Já na /busca: troca o termo sem empilhar histórico. Em outra página:
        // entra na /busca (uma entrada no histórico, pra o "voltar" funcionar).
        if (window.location.pathname === "/busca") router.replace(destino, { scroll: false });
        else router.push(destino, { scroll: false });
      } else if (window.location.pathname === "/busca") {
        router.replace(destino, { scroll: false }); // limpou o campo: zera a busca
      }
    }, 300);
    return () => clearTimeout(t);
  }, [termo, router]);

  function buscar(e) {
    e.preventDefault();
    const q = termo.trim();
    router.push(q ? `/busca?q=${encodeURIComponent(q)}` : "/", { scroll: false });
  }

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <div className="mx-auto flex max-w-6xl items-center gap-3 rounded-2xl border border-white/60 bg-white/70 py-2 pl-3 pr-2 shadow-card backdrop-blur-xl sm:gap-5 sm:pl-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Central da Compra — início">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Central da Compra" className="h-9 w-9 rounded-xl object-cover" />
          <span className="hidden text-base font-semibold tracking-tight text-cc-ink sm:block">
            Central da Compra
          </span>
        </Link>

        {/* Busca */}
        <form onSubmit={buscar} className="flex flex-1 items-center" role="search">
          <div className="flex w-full max-w-xl items-center rounded-xl border border-cc-line bg-white pl-3 focus-within:border-cc-yellow focus-within:ring-2 focus-within:ring-cc-yellow/30 sm:pl-4">
            <input
              type="search"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Buscar produtos..."
              aria-label="Buscar produtos"
              className="w-full min-w-0 bg-transparent py-2 text-sm outline-none placeholder:text-cc-muted"
            />
            {/* Em telas estreitas, só o ícone (economiza espaço pro campo de busca) */}
            <button
              type="submit"
              aria-label="Buscar"
              className="m-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cc-ink text-white transition hover:bg-black sm:h-auto sm:w-auto sm:px-4 sm:py-1.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:hidden" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3-3" />
              </svg>
              <span className="hidden text-sm font-medium sm:inline">Buscar</span>
            </button>
          </div>
        </form>

        {/* Favoritos */}
        <Link
          href="/favoritos"
          aria-label="Meus favoritos"
          title="Meus favoritos"
          className="relative flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-2 text-cc-ink transition hover:bg-cc-cream"
        >
          <span className="relative">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 21s-7.5-4.6-10-9.2C.6 9 1.6 5.5 4.8 4.8 7 4.3 9 5.5 12 8.5c3-3 5-4.2 7.2-3.7 3.2.7 4.2 4.2 2.8 7C19.5 16.4 12 21 12 21z" />
            </svg>
            {montado && favs > 0 ? (
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-cc-yellow px-1 text-[10px] font-bold leading-none text-cc-ink">
                {favs > 99 ? "99+" : favs}
              </span>
            ) : null}
          </span>
          <span className="hidden text-sm font-medium sm:block">Favoritos</span>
        </Link>
      </div>
    </header>
  );
}
