"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CategoryBar from "@/components/CategoryBar";

export default function Header() {
  const router = useRouter();
  const [termo, setTermo] = useState("");

  function buscar(e) {
    e.preventDefault();
    const q = termo.trim();
    router.push(q ? `/busca?q=${encodeURIComponent(q)}` : "/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-cc-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-5">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Central da Compra — início">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Central da Compra"
            className="h-11 w-11 rounded-xl object-cover"
          />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="cc-mono text-lg text-cc-ink">Central da Compra</span>
            <span className="text-[11px] tracking-wide text-cc-muted">os melhores achados</span>
          </span>
        </Link>

        {/* Busca */}
        <form onSubmit={buscar} className="flex flex-1 items-center" role="search">
          <div className="flex w-full items-center rounded-full border border-cc-line bg-white pl-4 focus-within:border-cc-yellow focus-within:ring-2 focus-within:ring-cc-yellow/30">
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

      <CategoryBar />
    </header>
  );
}
