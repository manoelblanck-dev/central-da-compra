"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { sanitizarBusca } from "@/lib/constantes";
import ProductGrid from "@/components/ProductGrid";
import SkeletonGrid from "@/components/SkeletonGrid";
import { IconFiltro } from "@/components/IconesSelo";

const POR_PAGINA = 12;
const MAXP = 1000; // teto do slider de preço
const PLATS = [
  { id: "shopee", nome: "Shopee" },
  { id: "mercado_livre", nome: "Mercado Livre" },
  { id: "tiktok_shop", nome: "TikTok Shop" },
];

// Resultados da busca por nome + os MESMOS filtros das categorias (preço,
// plataforma, ordenação). O termo vem da caixa de busca do topo (pela URL) e
// tudo se atualiza ao vivo. Não tem campo de busca próprio — a caixa é só a do
// topo (uma só, sem duplicar).
export default function BuscaResultados({ termo = "" }) {
  const [produtos, setProdutos] = useState([]);
  const [offset, setOffset] = useState(0);
  const [acabou, setAcabou] = useState(true);
  const [buscando, setBuscando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [drawer, setDrawer] = useState(false);

  const [precoMin, setPrecoMin] = useState(0);
  const [precoMax, setPrecoMax] = useState(MAXP);
  const [plataformas, setPlataformas] = useState([]);
  const [ordenar, setOrdenar] = useState("recentes");

  const reqId = useRef(0); // descarta respostas de buscas antigas (corrida)

  const termoLimpo = sanitizarBusca(termo);

  // Monta a consulta: nome (todas as palavras) + filtros + ordenação + página.
  function montaQuery(off) {
    const palavras = termoLimpo.split(/\s+/).filter(Boolean);
    let q = supabase.from("produtos").select("*");
    // Cada palavra precisa aparecer no nome OU na descrição (busca por partes).
    for (const p of palavras) q = q.or(`nome.ilike.%${p}%,descricao.ilike.%${p}%`);
    if (plataformas.length) q = q.in("plataforma", plataformas);
    if (precoMin > 0) q = q.gte("preco", precoMin);
    if (precoMax < MAXP) q = q.lte("preco", precoMax);
    if (ordenar === "menor") q = q.order("preco", { ascending: true, nullsFirst: false });
    else if (ordenar === "maior") q = q.order("preco", { ascending: false, nullsFirst: false });
    else if (ordenar === "desconto")
      q = q.order("desconto_percent", { ascending: false, nullsFirst: false });
    else if (ordenar === "avaliacao") q = q.order("nota", { ascending: false, nullsFirst: false });
    else q = q.order("criado_em", { ascending: false });
    return q.range(off, off + POR_PAGINA - 1);
  }

  // Refaz a busca ao vivo quando o termo OU qualquer filtro muda (com atraso).
  useEffect(() => {
    if (!termoLimpo) {
      setProdutos([]);
      setOffset(0);
      setAcabou(true);
      setBuscando(false);
      return;
    }
    const id = ++reqId.current;
    setBuscando(true);
    const t = setTimeout(async () => {
      const { data } = await montaQuery(0);
      if (id !== reqId.current) return; // chegou atrasada: ignora
      const novos = data || [];
      setProdutos(novos);
      setOffset(novos.length);
      setAcabou(novos.length < POR_PAGINA);
      setBuscando(false);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termoLimpo, precoMin, precoMax, plataformas, ordenar]);

  async function carregarMais() {
    if (!termoLimpo) return;
    setCarregando(true);
    try {
      const { data } = await montaQuery(offset);
      const novos = data || [];
      setProdutos((p) => [...p, ...novos]);
      setOffset((o) => o + novos.length);
      if (novos.length < POR_PAGINA) setAcabou(true);
    } finally {
      setCarregando(false);
    }
  }

  function togglePlat(id) {
    setPlataformas((ps) => (ps.includes(id) ? ps.filter((x) => x !== id) : [...ps, id]));
  }
  function limpar() {
    setPrecoMin(0);
    setPrecoMax(MAXP);
    setPlataformas([]);
    setOrdenar("recentes");
  }

  const fillLeft = (precoMin / MAXP) * 100;
  const fillWidth = ((precoMax - precoMin) / MAXP) * 100;

  // Sem termo digitado: só um aviso (a busca é a do topo).
  if (!termoLimpo) {
    return (
      <ProductGrid produtos={[]} vazio="Digite na busca do topo para encontrar produtos." />
    );
  }

  const Sidebar = (
    <div className="rounded-2xl border border-cc-line bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-cc-line px-4 py-3">
        <h3 className="text-[15px] font-bold text-cc-ink">Filtros</h3>
        <button onClick={limpar} className="text-[11px] font-semibold text-cc-muted hover:text-cc-ink">
          Limpar
        </button>
      </div>

      {/* Ordenar */}
      <div className="border-b border-cc-line px-4 py-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-cc-muted">Ordenar por</p>
        <select
          value={ordenar}
          onChange={(e) => setOrdenar(e.target.value)}
          className="w-full rounded-lg border border-cc-line p-2 text-sm outline-none focus:border-cc-yellow"
        >
          <option value="recentes">Mais recentes</option>
          <option value="desconto">Maior desconto</option>
          <option value="avaliacao">Melhor avaliação</option>
          <option value="menor">Menor preço</option>
          <option value="maior">Maior preço</option>
        </select>
      </div>

      {/* Preço */}
      <div className="border-b border-cc-line px-4 py-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-cc-muted">Preço</p>
        <div className="relative h-[18px]">
          <div className="absolute left-0 right-0 top-[7px] h-1 bg-cc-line" />
          <div
            className="absolute top-[7px] h-1 bg-cc-yellow"
            style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
          />
          <input
            type="range"
            min={0}
            max={MAXP}
            step={10}
            value={precoMin}
            onChange={(e) => setPrecoMin(Math.min(Number(e.target.value), precoMax))}
            className="cc-range"
            style={{ zIndex: 3 }}
            aria-label="Preço mínimo"
          />
          <input
            type="range"
            min={0}
            max={MAXP}
            step={10}
            value={precoMax}
            onChange={(e) => setPrecoMax(Math.max(Number(e.target.value), precoMin))}
            className="cc-range"
            style={{ zIndex: 2 }}
            aria-label="Preço máximo"
          />
        </div>
        <div className="mt-1 flex justify-between text-xs font-semibold text-cc-ink">
          <span>R$ {precoMin}</span>
          <span>{precoMax >= MAXP ? `R$ ${MAXP}+` : `R$ ${precoMax}`}</span>
        </div>
      </div>

      {/* Plataforma */}
      <div className="px-4 py-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-cc-muted">Plataforma</p>
        {PLATS.map((p) => (
          <label key={p.id} className="flex cursor-pointer items-center gap-2 py-1 text-sm text-cc-ink">
            <input
              type="checkbox"
              checked={plataformas.includes(p.id)}
              onChange={() => togglePlat(p.id)}
              className="h-[15px] w-[15px] accent-cc-yellow"
            />
            {p.nome}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* botão de filtro no mobile */}
      <button
        onClick={() => setDrawer(true)}
        className="mb-4 inline-flex items-center gap-2 rounded-xl bg-cc-ink px-4 py-2.5 text-sm font-semibold text-white md:hidden"
      >
        <IconFiltro className="h-4 w-4" /> Filtrar
      </button>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[240px_1fr]">
        {/* sidebar no desktop */}
        <aside className="sticky top-28 hidden md:block">{Sidebar}</aside>

        <div>
          {buscando ? (
            <SkeletonGrid count={8} />
          ) : (
            <ProductGrid
              produtos={produtos}
              vazio="Nenhum produto com esses filtros. Tente outras palavras ou amplie a faixa de preço."
            />
          )}
          {!acabou && !buscando && produtos.length > 0 ? (
            <div className="mt-8 text-center">
              <button
                onClick={carregarMais}
                disabled={carregando}
                className="rounded-xl bg-cc-ink px-7 py-3 text-sm font-semibold text-white transition hover:bg-black active:translate-y-px disabled:opacity-60"
              >
                {carregando ? "Carregando..." : "Carregar mais"}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* gaveta de filtro no mobile */}
      {drawer ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 h-full w-[280px] overflow-y-auto rounded-r-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-cc-line px-4 py-3">
              <span className="font-bold text-cc-ink">Filtrar</span>
              <button onClick={() => setDrawer(false)} aria-label="Fechar" className="text-cc-muted">
                ✕
              </button>
            </div>
            {Sidebar}
            <div className="p-4">
              <button
                onClick={() => setDrawer(false)}
                className="w-full rounded-xl bg-cc-yellow py-3 text-sm font-bold text-cc-ink"
              >
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
