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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur">
      {/* Faixa da Copa */}
      <div className="bg-br-green px-3 py-1.5 text-center text-[13px] font-semibold text-white">
        ⚽ Especial Copa do Mundo
        <span className="mx-2 inline-block h-2 w-2 rounded-full bg-cc-yellow align-middle" />
        Vai, Brasil!
        <span className="mx-2 inline-block h-2 w-2 rounded-full bg-cc-yellow align-middle" />
        ofertas da seleção toda semana
      </div>

      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:gap-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Central da Compra — início">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Central da Compra"
            className="h-11 w-11 object-cover"
          />
          <span className="hidden cc-mono text-xl text-cc-ink sm:block">
            Central da Compra
          </span>
        </Link>

        {/* Busca (única parte arredondada do site) */}
        <form onSubmit={buscar} className="flex flex-1 items-center" role="search">
          <div className="flex w-full max-w-xl items-center rounded-full border border-cc-line bg-white pl-4 focus-within:border-cc-yellow focus-within:ring-2 focus-within:ring-cc-yellow/30">
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
              className="m-1 rounded-full bg-cc-yellow px-4 py-1.5 text-sm font-semibold text-cc-ink transition hover:bg-cc-yellow-dark"
            >
              Buscar
            </button>
          </div>
        </form>
      </div>

      {/* Listra tricolor da Seleção */}
      <div className="flex h-[5px]">
        <span className="flex-1 bg-br-green" />
        <span className="flex-1 bg-cc-yellow" />
        <span className="flex-1 bg-br-blue" />
      </div>
    </header>
  );
}
