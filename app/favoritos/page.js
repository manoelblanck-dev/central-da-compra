"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProductGrid from "@/components/ProductGrid";
import SkeletonGrid from "@/components/SkeletonGrid";

// Formato de UUID válido — descarta "lixo" de versões antigas do site.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function lerFavs() {
  try {
    const v = JSON.parse(localStorage.getItem("cc_favoritos") || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function salvarFavs(ids) {
  try {
    localStorage.setItem("cc_favoritos", JSON.stringify(ids));
  } catch {
    /* ignora */
  }
  // Avisa o Header pra atualizar o número na hora.
  window.dispatchEvent(new Event("cc-favoritos"));
}

export default function FavoritosPage() {
  const [produtos, setProdutos] = useState(null); // null = carregando

  async function carregar() {
    const brutos = lerFavs();
    // Só ids em formato válido (remove lixo de versões antigas).
    const ids = brutos.filter((id) => typeof id === "string" && UUID.test(id));
    if (!ids.length) {
      if (brutos.length) salvarFavs([]); // tinha lixo: limpa e corrige o contador
      setProdutos([]);
      return;
    }

    const { data, error } = await supabase.from("produtos").select("*").in("id", ids);
    // Se a busca falhou, não mexe nos favoritos (evita apagar por engano).
    if (error) {
      setProdutos([]);
      return;
    }

    const existentes = new Set((data || []).map((p) => p.id));
    const validos = ids.filter((id) => existentes.has(id));
    // Autolimpeza: se sobrou id inválido ou de produto excluído, reescreve a lista.
    if (validos.length !== brutos.length) salvarFavs(validos);

    // mantém a ordem em que foram salvos
    const ordenados = validos.map((id) => (data || []).find((p) => p.id === id)).filter(Boolean);
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
      <h1 className="mb-1 cc-mono text-3xl text-cc-ink">Meus favoritos</h1>
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
