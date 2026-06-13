"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProductGrid from "@/components/ProductGrid";
import SkeletonGrid from "@/components/SkeletonGrid";

function lerFavs() {
  try {
    return JSON.parse(localStorage.getItem("cc_favoritos") || "[]");
  } catch {
    return [];
  }
}

export default function FavoritosPage() {
  const [produtos, setProdutos] = useState(null); // null = carregando

  async function carregar() {
    const ids = lerFavs();
    if (!ids.length) {
      setProdutos([]);
      return;
    }
    const { data } = await supabase.from("produtos").select("*").in("id", ids);
    // mantém a ordem em que foram salvos
    const ordenados = ids
      .map((id) => (data || []).find((p) => p.id === id))
      .filter(Boolean);
    setProdutos(ordenados);
  }

  useEffect(() => {
    carregar();
    const aoMudar = () => carregar();
    window.addEventListener("cc-favoritos", aoMudar);
    return () => window.removeEventListener("cc-favoritos", aoMudar);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 cc-mono text-3xl text-cc-ink">❤️ Meus favoritos</h1>
      <p className="mb-6 text-sm text-cc-muted">
        Os produtos que você salvou ficam guardados aqui neste aparelho.
      </p>

      {produtos === null ? (
        <SkeletonGrid count={4} />
      ) : produtos.length === 0 ? (
        <div className="border border-cc-line bg-cc-cream/50 px-6 py-12 text-center">
          <p className="text-cc-ink">Você ainda não salvou nenhum produto.</p>
          <p className="mt-1 text-sm text-cc-muted">
            Toque no coração de qualquer produto para guardá-lo aqui.
          </p>
          <Link
            href="/produtos"
            className="mt-5 inline-block bg-cc-yellow px-6 py-3 text-sm font-bold text-cc-ink transition hover:bg-cc-yellow-dark active:translate-y-px"
          >
            Ver produtos
          </Link>
        </div>
      ) : (
        <ProductGrid produtos={produtos} />
      )}
    </div>
  );
}
