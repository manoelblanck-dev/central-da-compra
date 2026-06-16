"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { sanitizarBusca } from "@/lib/constantes";
import ProductGrid from "@/components/ProductGrid";
import SkeletonGrid from "@/components/SkeletonGrid";

const POR_PAGINA = 12;

// Busca uma página de produtos pelo termo. Tenta a função do banco
// (buscar_produtos) e, se ela ainda não existir, cai num ILIKE simples.
async function buscarPagina(termo, offset) {
  const q = (termo || "").trim();
  if (!q) return [];
  const { data, error } = await supabase.rpc("buscar_produtos", {
    termo: q,
    lim: POR_PAGINA,
    off: offset,
  });
  if (!error && data) return data;
  const seguro = sanitizarBusca(q);
  if (!seguro) return [];
  const { data: d2 } = await supabase
    .from("produtos")
    .select("*")
    .or(`nome.ilike.%${seguro}%,descricao.ilike.%${seguro}%`)
    .order("criado_em", { ascending: false })
    .range(offset, offset + POR_PAGINA - 1);
  return d2 || [];
}

// Busca ao vivo: o resultado se atualiza enquanto a pessoa digita (com um
// pequeno atraso pra não consultar o banco a cada tecla). Funciona igual no PC
// e no celular. A primeira lista vem pronta do servidor (`inicial`) pra a
// página abrir rápida e aparecer no Google.
export default function BuscaAoVivo({ termoInicial = "", inicial = [] }) {
  const [termo, setTermo] = useState(termoInicial);
  const [produtos, setProdutos] = useState(inicial);
  const [offset, setOffset] = useState(inicial.length);
  const [acabou, setAcabou] = useState(inicial.length < POR_PAGINA);
  const [buscando, setBuscando] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);

  const primeira = useRef(true); // não refaz a busca inicial (já veio do servidor)
  const reqId = useRef(0); // descarta respostas de buscas antigas (condição de corrida)

  // Veio um termo novo pela URL (ex.: enviado pela busca do topo do site): adota.
  useEffect(() => {
    setTermo(termoInicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termoInicial]);

  // Coração da busca ao vivo: roda sozinha sempre que o termo muda.
  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    const q = termo.trim();

    // Reflete o termo na URL (sem recarregar) pra poder atualizar/compartilhar.
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", q ? `/busca?q=${encodeURIComponent(q)}` : "/busca");
    }

    if (!q) {
      setProdutos([]);
      setOffset(0);
      setAcabou(true);
      setBuscando(false);
      return;
    }

    const id = ++reqId.current;
    setBuscando(true);
    const t = setTimeout(async () => {
      const novos = await buscarPagina(q, 0);
      if (id !== reqId.current) return; // chegou atrasada: ignora
      setProdutos(novos);
      setOffset(novos.length);
      setAcabou(novos.length < POR_PAGINA);
      setBuscando(false);
    }, 300);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termo]);

  async function carregarMais() {
    const q = termo.trim();
    if (!q) return;
    setCarregandoMais(true);
    try {
      const novos = await buscarPagina(q, offset);
      setProdutos((p) => [...p, ...novos]);
      setOffset((o) => o + novos.length);
      if (novos.length < POR_PAGINA) setAcabou(true);
    } finally {
      setCarregandoMais(false);
    }
  }

  const termoLimpo = termo.trim();

  return (
    <>
      <div className="mb-6 max-w-xl">
        <input
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          autoFocus
          placeholder="Buscar produtos..."
          aria-label="Buscar produtos"
          className="w-full rounded-xl border border-cc-line bg-white px-4 py-3 text-sm outline-none focus:border-cc-yellow focus:ring-2 focus:ring-cc-yellow/30"
        />
        {termoLimpo ? (
          <p className="mt-2 text-sm text-cc-muted">
            {buscando ? "Buscando..." : `Resultados para “${termoLimpo}”`}
          </p>
        ) : null}
      </div>

      {buscando ? (
        <SkeletonGrid count={8} />
      ) : (
        <ProductGrid
          produtos={produtos}
          vazio={
            termoLimpo
              ? "Nenhum produto encontrado. Tente outras palavras."
              : "Digite algo acima para buscar produtos."
          }
        />
      )}

      {!buscando && !acabou && produtos.length > 0 ? (
        <div className="mt-8 text-center">
          <button
            onClick={carregarMais}
            disabled={carregandoMais}
            className="rounded-xl bg-cc-ink px-7 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-60"
          >
            {carregandoMais ? "Carregando..." : "Carregar mais"}
          </button>
        </div>
      ) : null}
    </>
  );
}
