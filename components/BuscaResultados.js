"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { sanitizarBusca } from "@/lib/constantes";
import ProductGrid from "@/components/ProductGrid";
import SkeletonGrid from "@/components/SkeletonGrid";

const POR_PAGINA = 12;

// Busca uma página de produtos pelo termo. Tenta a função do banco
// (buscar_produtos) e, se não existir, cai num ILIKE simples.
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

// Resultados da busca. O termo vem da caixa de busca do TOPO do site (pela URL)
// e os resultados se atualizam ao vivo conforme a pessoa digita. Não tem campo
// de busca próprio — a busca é só a do topo (uma só, sem duplicar).
export default function BuscaResultados({ termo = "" }) {
  const [produtos, setProdutos] = useState([]);
  const [offset, setOffset] = useState(0);
  const [acabou, setAcabou] = useState(true);
  const [buscando, setBuscando] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const reqId = useRef(0); // descarta respostas de buscas antigas (condição de corrida)

  useEffect(() => {
    const q = (termo || "").trim();
    if (!q) {
      setProdutos([]);
      setOffset(0);
      setAcabou(true);
      setBuscando(false);
      return;
    }
    const id = ++reqId.current;
    setBuscando(true);
    (async () => {
      const novos = await buscarPagina(q, 0);
      if (id !== reqId.current) return; // chegou atrasada: ignora
      setProdutos(novos);
      setOffset(novos.length);
      setAcabou(novos.length < POR_PAGINA);
      setBuscando(false);
    })();
  }, [termo]);

  async function carregarMais() {
    const q = (termo || "").trim();
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

  const termoLimpo = (termo || "").trim();

  if (buscando) return <SkeletonGrid count={8} />;

  return (
    <>
      <ProductGrid
        produtos={produtos}
        vazio={
          termoLimpo
            ? "Nenhum produto encontrado. Tente outras palavras."
            : "Use a busca no topo da página para encontrar produtos."
        }
      />
      {!acabou && produtos.length > 0 ? (
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
