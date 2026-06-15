"use client";

import { useState, useEffect, useCallback } from "react";
import { PLATAFORMAS } from "@/lib/constantes";
import FormLoteCupons from "@/components/admin/FormLoteCupons";

export default function SecaoCupons() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState("");
  const [novo, setNovo] = useState({ plataforma: "shopee", codigo: "", descricao: "", validade: "", minimo: "" });
  const [loteCupom, setLoteCupom] = useState(false);
  const [selecionados, setSelecionados] = useState([]); // índices marcados na lista

  const carregar = useCallback(async () => {
    try {
      const res = await fetch("/api/config?chave=cupons");
      const data = await res.json();
      if (Array.isArray(data?.valor)) setLista(data.valor);
    } catch {
      /* ignora */
    }
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function persistir(nova) {
    setSalvando(true);
    setMsg("");
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chave: "cupons", valor: nova }),
      });
      const data = await res.json();
      if (res.ok) {
        setLista(nova);
        setMsg("✅ Cupons atualizados!");
      } else {
        setMsg(data.erro || "Erro ao salvar.");
      }
    } catch {
      setMsg("Erro de conexão.");
    } finally {
      setSalvando(false);
    }
  }

  function adicionar() {
    const codigo = novo.codigo.trim();
    if (!codigo) {
      setMsg("Informe o código do cupom.");
      return;
    }
    const nova = [...lista, { ...novo, codigo: codigo.toUpperCase() }];
    persistir(nova);
    setNovo({ plataforma: "shopee", codigo: "", descricao: "", validade: "", minimo: "" });
  }

  function remover(i) {
    persistir(lista.filter((_, idx) => idx !== i));
    setSelecionados((sel) => sel.filter((idx) => idx !== i).map((idx) => (idx > i ? idx - 1 : idx)));
  }

  function toggleSelecionado(i) {
    setSelecionados((sel) => (sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i]));
  }

  function toggleTodos() {
    setSelecionados((sel) => (sel.length === lista.length ? [] : lista.map((_, idx) => idx)));
  }

  async function removerSelecionados() {
    if (selecionados.length === 0) return;
    if (!confirm(`Remover ${selecionados.length} cupom(ns) selecionado(s)?`)) return;
    await persistir(lista.filter((_, idx) => !selecionados.includes(idx)));
    setSelecionados([]);
  }

  const nomePlat = (id) =>
    id === "mercado_livre" ? "Mercado Livre" : id === "tiktok_shop" ? "TikTok Shop" : "Shopee";

  const campo = "w-full border border-cc-line px-3 py-2 text-sm outline-none focus:border-cc-yellow";
  const rotulo = "mb-1 block text-sm font-medium text-cc-ink";

  return (
    <div className="mt-4 border border-cc-line bg-white p-5">
      <h2 className="cc-mono text-xl text-cc-ink">🎟️ Cupons ativos</h2>
      <p className="mt-1 text-xs text-cc-muted">
        Cadastre quantos cupons quiser. Eles aparecem automaticamente nos produtos da
        plataforma correspondente e numa faixa na home. Dá pra adicionar um por um ou
        colar vários de uma vez.
      </p>

      {carregando ? (
        <p className="mt-4 text-sm text-cc-muted">Carregando...</p>
      ) : (
        <div className="mt-4 space-y-4">
          {lista.length > 0 ? (
            <>
              {/* ações em lote */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs font-medium text-cc-ink">
                  <input
                    type="checkbox"
                    checked={selecionados.length === lista.length}
                    onChange={toggleTodos}
                    className="h-4 w-4 accent-cc-yellow"
                  />
                  Selecionar todos
                </label>
                {selecionados.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-700">
                      {selecionados.length} selecionado(s)
                    </span>
                    <button
                      onClick={removerSelecionados}
                      disabled={salvando}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      Remover selecionados
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="divide-y divide-cc-line border border-cc-line">
                {lista.map((c, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selecionados.includes(i)}
                        onChange={() => toggleSelecionado(i)}
                        className="h-4 w-4 accent-cc-yellow"
                        aria-label={`Selecionar cupom ${c.codigo}`}
                      />
                      <div>
                        <span className="font-semibold text-cc-ink">{nomePlat(c.plataforma)}</span>{" "}
                        — <span className="cc-mono">{c.codigo}</span>
                        {c.descricao ? <span className="text-cc-muted"> · {c.descricao}</span> : ""}
                        {c.minimo ? <span className="text-cc-muted"> · mín. R${c.minimo}</span> : ""}
                        {c.validade ? <span className="text-cc-muted"> · até {c.validade}</span> : ""}
                      </div>
                    </div>
                    <button
                      onClick={() => remover(i)}
                      disabled={salvando}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      remover
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-cc-muted">Nenhum cupom cadastrado ainda.</p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={rotulo}>Plataforma</label>
              <select
                value={novo.plataforma}
                onChange={(e) => setNovo((n) => ({ ...n, plataforma: e.target.value }))}
                className={campo}
              >
                {PLATAFORMAS.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={rotulo}>Código</label>
              <input
                value={novo.codigo}
                onChange={(e) => setNovo((n) => ({ ...n, codigo: e.target.value }))}
                className={campo}
                placeholder="CUPOM10"
              />
            </div>
            <div>
              <label className={rotulo}>Descrição (opcional)</label>
              <input
                value={novo.descricao}
                onChange={(e) => setNovo((n) => ({ ...n, descricao: e.target.value }))}
                className={campo}
                placeholder="10% OFF acima de R$ 50"
              />
            </div>
            <div>
              <label className={rotulo}>Validade (opcional)</label>
              <input
                value={novo.validade}
                onChange={(e) => setNovo((n) => ({ ...n, validade: e.target.value }))}
                className={campo}
                placeholder="30/06"
              />
            </div>
            <div>
              <label className={rotulo}>Valor mínimo de compra (opcional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={novo.minimo}
                onChange={(e) => setNovo((n) => ({ ...n, minimo: e.target.value }))}
                className={campo}
                placeholder="40"
              />
              <p className="mt-1 text-xs text-cc-muted">
                Se preencher, o cupom só aparece em produtos com preço igual ou acima disso.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={adicionar}
              disabled={salvando}
              className="bg-cc-yellow px-5 py-2.5 text-sm font-bold text-cc-ink transition hover:bg-cc-yellow-dark active:translate-y-px disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "+ Adicionar cupom"}
            </button>
            <button
              onClick={() => {
                setMsg("");
                setLoteCupom(true);
              }}
              className="border border-cc-line px-4 py-2.5 text-sm font-medium text-cc-ink transition hover:bg-cc-cream"
            >
              + Adicionar vários
            </button>
            {msg ? <span className="text-sm text-cc-ink">{msg}</span> : null}
          </div>
        </div>
      )}

      {/* modal: adicionar vários cupons (mesmo padrão dos produtos) */}
      {loteCupom ? (
        <FormLoteCupons
          listaAtual={lista}
          fechar={() => setLoteCupom(false)}
          aoConcluir={() => {
            setLoteCupom(false);
            carregar();
          }}
        />
      ) : null}
    </div>
  );
}

