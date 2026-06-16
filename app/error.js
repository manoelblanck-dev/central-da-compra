"use client";

import { useEffect } from "react";
import Link from "next/link";

// Barreira de erro: se qualquer página der um erro inesperado em runtime
// (ex.: o banco oscilar), o visitante vê esta tela amigável — com a marca,
// um botão de "tentar de novo" e o caminho de volta — em vez da tela genérica
// e assustadora do Next. Importante quando há tráfego pago chegando.
export default function Error({ error, reset }) {
  useEffect(() => {
    // Registra no console pra facilitar o diagnóstico.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="cc-mono text-6xl text-cc-yellow">CC</span>
      <h1 className="mt-4 cc-mono text-2xl text-cc-ink">Algo deu errado</h1>
      <p className="mt-2 text-sm text-cc-muted">
        Tivemos um probleminha ao carregar esta página. Tente de novo — geralmente resolve na hora.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => reset()}
          className="bg-cc-yellow px-6 py-2.5 text-sm font-bold text-cc-ink transition hover:bg-cc-yellow-dark active:translate-y-px"
        >
          Tentar de novo
        </button>
        <Link
          href="/"
          className="border border-cc-line px-6 py-2.5 text-sm font-medium text-cc-ink transition hover:bg-cc-cream"
        >
          Voltar para a home
        </Link>
      </div>
    </div>
  );
}
