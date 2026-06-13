"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const [termo, setTermo] = useState("");

  function buscar(e) {
    e.preventDefault();
    const q = termo.trim();
    router.push(q ? `/busca?q=${encodeURIComponent(q)}` : "/");
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
          <div className="flex w-full max-w-xl items-center rounded-xl border border-cc-line bg-white pl-4 focus-within:border-cc-yellow focus-within:ring-2 focus-within:ring-cc-yellow/30">
            <input
              type="search"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Buscar produtos..."
              aria-label="Buscar produtos"
              className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-cc-muted"
            />
            <button
              type="submit"
              className="m-1 rounded-lg bg-cc-ink px-4 py-1.5 text-sm font-medium text-white transition hover:bg-black"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Favoritos */}
        <Link
          href="/favoritos"
          aria-label="Meus favoritos"
          title="Meus favoritos"
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-2 text-cc-ink transition hover:bg-cc-cream"
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 21s-7.5-4.6-10-9.2C.6 9 1.6 5.5 4.8 4.8 7 4.3 9 5.5 12 8.5c3-3 5-4.2 7.2-3.7 3.2.7 4.2 4.2 2.8 7C19.5 16.4 12 21 12 21z" />
          </svg>
          <span className="hidden text-sm font-medium sm:block">Favoritos</span>
        </Link>
      </div>
    </header>
  );
}
