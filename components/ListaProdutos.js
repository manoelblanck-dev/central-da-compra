"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { sanitizarBusca } from "@/lib/constantes";
import ProductGrid from "@/components/ProductGrid";

// Busca a próxima página de produtos conforme o tipo da listagem.
async function buscarPagina(tipo, params, offset, porPagina) {
  if (tipo === "busca") {
    const q = params.q || "";
    const { data, error } = await supabase.rpc("buscar_produtos", {
      termo: q,
      lim: porPagina,
      off: offset,
    });
    if (!error && data) return data;
    // Fallback: se a função de busca ainda não existir no banco, usa busca simples.
    const seguro = sanitizarBusca(q);
    if (!seguro) return [];
    const { data: d2 } = await supabase
      .from("produtos")
      .select("*")
      .or(`nome.ilike.%${seguro}%,descricao.ilike.%${seguro}%`)
      .order("criado_em", { ascending: false })
      .range(offset, offset + porPagina - 1);
    return d2 || [];
  }

  let query = supabase.from("produtos").select("*");
  if (tipo === "categoria") query = query.eq("categoria", params.slug);
  if (tipo === "ofertas") query = query.eq("destaque", true);
  query = query
    .order("criado_em", { ascending: false })
    .range(offset, offset + porPagina - 1);
  const { data } = await query;
  return data || [];
}

export default function ListaProdutos({ inicial = [], tipo, params = {}, porPagina = 12, vazio }) {
  const [produtos, setProdutos] = useState(inicial);
  const [offset, setOffset] = useState(inicial.length);
  const [carregando, setCarregando] = useState(false);
  const [acabou, setAcabou] = useState(inicial.length < porPagina);

  async function carregarMais() {
    setCarregando(true);
    try {
      const novos = await buscarPagina(tipo, params, offset, porPagina);
      setProdutos((p) => [...p, ...novos]);
      setOffset((o) => o + novos.length);
      if (novos.length < porPagina) setAcabou(true);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <ProductGrid produtos={produtos} vazio={vazio} />
      {!acabou && produtos.length > 0 ? (
        <div className="mt-8 text-center">
          <button
            onClick={carregarMais}
            disabled={carregando}
            className="bg-cc-ink px-7 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-60"
          >
            {carregando ? "Carregando..." : "Carregar mais"}
          </button>
        </div>
      ) : null}
    </>
  );
}
