"use client";

import { useEffect, useMemo, useState } from "react";
import { formatarPreco } from "@/lib/constantes";

// Descobre qual item da fila está no ar agora e quando troca, a partir da hora.
function calcularAtual(fila, horas, inicioMs, repetir, nowMs) {
  if (!fila.length || !inicioMs) return null;
  const dur = (Number(horas) > 0 ? Number(horas) : 12) * 3600 * 1000;
  const passou = nowMs - inicioMs;
  if (passou < 0) return { idx: 0, terminaEm: inicioMs, futuro: true };
  const rawIdx = Math.floor(passou / dur);
  if (!repetir && rawIdx >= fila.length) return null; // fila acabou (modo não-repetir)
  const idx = repetir ? rawIdx % fila.length : Math.min(rawIdx, fila.length - 1);
  return { idx, terminaEm: inicioMs + (rawIdx + 1) * dur, futuro: false };
}

export default function SecaoOfertaDia({ produtos = [], categorias = [], subcategorias = {} }) {
  const [fila, setFila] = useState([]); // lista de ids, em ordem
  const [horas, setHoras] = useState(12);
  const [inicio, setInicio] = useState(null); // ms
  const [repetir, setRepetir] = useState(true);
  const [busca, setBusca] = useState("");
  const [fCat, setFCat] = useState(""); // filtro categoria
  const [fSub, setFSub] = useState(""); // filtro subcategoria
  const [ordem, setOrdem] = useState("cliques"); // ordenação do buscador
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState("");
  const [agora, setAgora] = useState(Date.now());

  // Relógio pra a prévia "agora / troca em" se atualizar sozinha.
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/config?chave=oferta_do_dia");
        const data = await res.json();
        const v = data?.valor;
        if (v && typeof v === "object") {
          setFila(Array.isArray(v.produtos) ? v.produtos.filter(Boolean) : []);
          setHoras(Number(v.horas) > 0 ? Number(v.horas) : 12);
          setInicio(v.inicio ? Date.parse(v.inicio) : null);
          setRepetir(v.repetir !== false);
        }
      } catch {
        /* ignora */
      }
      setCarregando(false);
    })();
  }, []);

  const porId = useMemo(() => {
    const m = {};
    for (const p of produtos) m[p.id] = p;
    return m;
  }, [produtos]);

  const atual = calcularAtual(fila, horas, inicio, repetir, agora);

  function adicionar(id) {
    setBusca("");
    setFila((f) => (f.includes(id) ? f : [...f, id]));
  }
  function remover(id) {
    setFila((f) => f.filter((x) => x !== id));
  }
  function mover(i, dir) {
    setFila((f) => {
      const j = i + dir;
      if (j < 0 || j >= f.length) return f;
      const novo = [...f];
      [novo[i], novo[j]] = [novo[j], novo[i]];
      return novo;
    });
  }
  function comecarAgora() {
    setInicio(Date.now());
    setMsg("Marquei para a fila começar do 1º item. Clique em “Salvar” para aplicar.");
  }

  async function salvar() {
    setMsg("");
    setSalvando(true);
    const inicioFinal = inicio || Date.now();
    const valor = {
      produtos: fila,
      horas: Number(horas) > 0 ? Number(horas) : 12,
      inicio: new Date(inicioFinal).toISOString(),
      repetir,
    };
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chave: "oferta_do_dia", valor }),
      });
      const data = await res.json();
      if (res.ok) {
        setInicio(inicioFinal);
        setMsg("✅ Fila salva! Já está valendo na home.");
      } else {
        setMsg(data.erro || "Erro ao salvar.");
      }
    } catch {
      setMsg("Erro de conexão.");
    } finally {
      setSalvando(false);
    }
  }

  async function desativar() {
    if (!confirm("Voltar a Oferta do Dia para o modo automático (produto mais clicado)?")) return;
    setSalvando(true);
    setMsg("");
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chave: "oferta_do_dia", valor: null }),
      });
      setFila([]);
      setInicio(null);
      setMsg("Voltou para o automático (produto mais clicado).");
    } catch {
      setMsg("Erro de conexão.");
    } finally {
      setSalvando(false);
    }
  }

  const catNome = useMemo(() => {
    const m = {};
    for (const c of categorias) m[c.slug] = c.nome;
    return m;
  }, [categorias]);

  // Subcategorias da categoria filtrada (para o seletor de subcategoria).
  const subDaCat = fCat && Array.isArray(subcategorias[fCat]) ? subcategorias[fCat] : [];

  const naFila = useMemo(() => new Set(fila), [fila]);
  const termo = busca.trim().toLowerCase();

  // Ganho por venda = preço × comissão% (quanto você recebe por aquele produto).
  const ganho = (p) =>
    p.preco && p.comissao_percent ? (Number(p.preco) * Number(p.comissao_percent)) / 100 : 0;

  function ordenar(a, b) {
    if (ordem === "maior") return (Number(b.preco) || 0) - (Number(a.preco) || 0);
    if (ordem === "menor") return (Number(a.preco) || 0) - (Number(b.preco) || 0);
    if (ordem === "comissao_maior")
      return (Number(b.comissao_percent) || 0) - (Number(a.comissao_percent) || 0);
    if (ordem === "comissao_menor")
      return (Number(a.comissao_percent) || 0) - (Number(b.comissao_percent) || 0);
    if (ordem === "ganho") return ganho(b) - ganho(a);
    if (ordem === "avaliacao") return (Number(b.nota) || 0) - (Number(a.nota) || 0);
    if (ordem === "desconto")
      return (Number(b.desconto_percent) || 0) - (Number(a.desconto_percent) || 0);
    if (ordem === "recentes") return new Date(b.criado_em || 0) - new Date(a.criado_em || 0);
    return (b.cliques || 0) - (a.cliques || 0); // mais cliques (padrão)
  }

  const disponiveis = produtos
    .filter((p) => !naFila.has(p.id))
    .filter((p) => !termo || (p.nome || "").toLowerCase().includes(termo))
    .filter((p) => !fCat || p.categoria === fCat)
    .filter((p) => !fSub || (Array.isArray(p.subcategorias) && p.subcategorias.includes(fSub)))
    .sort(ordenar);
  const visiveis = disponiveis.slice(0, 50);

  function tempoRestante(terminaEm) {
    let d = Math.max(0, terminaEm - agora);
    const h = Math.floor(d / 3600000);
    d -= h * 3600000;
    const m = Math.floor(d / 60000);
    return `${h}h ${String(m).padStart(2, "0")}min`;
  }

  const campo = "w-full border border-cc-line px-3 py-2 text-sm outline-none focus:border-cc-yellow";

  return (
    <div className="mt-4 border border-cc-line bg-white p-5">
      <h2 className="cc-mono text-xl text-cc-ink">🔥 Oferta do dia</h2>
      <p className="mt-1 text-xs text-cc-muted">
        Monte a fila de ofertas: cada produto fica no ar por X horas e dá lugar ao próximo,
        automaticamente. Sem fila, a home volta ao automático (o produto mais clicado).
      </p>

      {carregando ? (
        <p className="mt-4 text-sm text-cc-muted">Carregando...</p>
      ) : (
        <div className="mt-4 space-y-5">
          {/* prévia */}
          <div className="rounded-xl border border-cc-line bg-cc-cream/50 px-4 py-3 text-sm">
            {fila.length === 0 ? (
              <span className="text-cc-muted">
                Fila vazia — a home está no <b>modo automático</b> (produto mais clicado).
              </span>
            ) : !inicio ? (
              <span className="text-cc-muted">
                Clique em <b>“Começar agora”</b> e depois em <b>Salvar</b> para a fila entrar no ar.
              </span>
            ) : atual?.futuro ? (
              <span className="text-cc-ink">
                ⏳ A fila começa em {tempoRestante(atual.terminaEm)}.
              </span>
            ) : atual ? (
              <span className="text-cc-ink">
                No ar agora: <b>{porId[fila[atual.idx]]?.nome || "produto removido"}</b> · troca em{" "}
                <b>{tempoRestante(atual.terminaEm)}</b>
                {fila.length > 1 ? (
                  <>
                    {" "}
                    · depois:{" "}
                    {porId[fila[(atual.idx + 1) % fila.length]]?.nome || "produto removido"}
                  </>
                ) : null}
              </span>
            ) : (
              <span className="text-cc-muted">
                A fila terminou (modo “não repetir”) — a home está no automático. Clique em
                “Começar agora” para rodar de novo.
              </span>
            )}
          </div>

          {/* configurações */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-40">
              <label className="mb-1 block text-sm font-medium text-cc-ink">
                Horas por oferta
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
                className={campo}
              />
            </div>
            <label className="flex items-center gap-2 py-2 text-sm text-cc-ink">
              <input
                type="checkbox"
                checked={repetir}
                onChange={(e) => setRepetir(e.target.checked)}
                className="h-4 w-4 accent-cc-yellow"
              />
              Repetir a fila quando acabar
            </label>
            <button
              onClick={comecarAgora}
              className="border border-cc-line px-4 py-2 text-sm font-medium text-cc-ink transition hover:bg-cc-cream"
            >
              Começar agora
            </button>
          </div>

          {/* adicionar produto — com filtros (nome, categoria, subcategoria, ordenação) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-cc-ink">
              Adicionar produto à fila
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="min-w-[150px] flex-1 border border-cc-line px-3 py-2 text-sm outline-none focus:border-cc-yellow"
                placeholder="Buscar pelo nome..."
              />
              <select
                value={fCat}
                onChange={(e) => {
                  setFCat(e.target.value);
                  setFSub("");
                }}
                className="border border-cc-line px-2.5 py-2 text-sm outline-none focus:border-cc-yellow"
              >
                <option value="">Todas as categorias</option>
                {categorias.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.nome}
                  </option>
                ))}
              </select>
              <select
                value={fSub}
                onChange={(e) => setFSub(e.target.value)}
                disabled={subDaCat.length === 0}
                className="border border-cc-line px-2.5 py-2 text-sm outline-none focus:border-cc-yellow disabled:cursor-not-allowed disabled:bg-cc-cream/40 disabled:text-cc-muted"
              >
                {subDaCat.length > 0 ? (
                  <>
                    <option value="">Todas as subcategorias</option>
                    {subDaCat.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.nome}
                      </option>
                    ))}
                  </>
                ) : (
                  <option value="">{fCat ? "Sem subcategorias" : "Subcategoria"}</option>
                )}
              </select>
              <select
                value={ordem}
                onChange={(e) => setOrdem(e.target.value)}
                className="border border-cc-line px-2.5 py-2 text-sm outline-none focus:border-cc-yellow"
              >
                <option value="cliques">Mais cliques</option>
                <option value="maior">Maior preço</option>
                <option value="menor">Menor preço</option>
                <option value="comissao_maior">Maior comissão (%)</option>
                <option value="comissao_menor">Menor comissão (%)</option>
                <option value="ganho">Maior ganho/venda</option>
                <option value="avaliacao">Melhor avaliação</option>
                <option value="desconto">Maior desconto</option>
                <option value="recentes">Mais recentes</option>
              </select>
            </div>

            <p className="mt-2 text-xs text-cc-muted">
              {disponiveis.length} produto(s)
              {disponiveis.length > visiveis.length ? ` (mostrando ${visiveis.length})` : ""} ·
              clique para adicionar à fila
            </p>
            {visiveis.length > 0 ? (
              <div className="mt-1 max-h-72 divide-y divide-cc-line overflow-y-auto rounded-xl border border-cc-line">
                {visiveis.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => adicionar(p.id)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-cc-cream/60"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imagem_url || "https://placehold.co/40x40/FFF8EC/211C15?text=CC"}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-cc-ink">{p.nome}</span>
                      <span className="block truncate text-xs text-cc-muted">
                        {catNome[p.categoria] || p.categoria} · {p.cliques || 0} cliques
                        {p.nota ? ` · ★ ${p.nota}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-right leading-tight">
                      <span className="block text-cc-ink">{formatarPreco(p.preco) || "—"}</span>
                      {ganho(p) > 0 ? (
                        <span className="block text-xs font-semibold text-br-green">
                          ganha {formatarPreco(ganho(p))}{" "}
                          <span className="text-cc-muted">({p.comissao_percent}%)</span>
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 font-semibold text-br-green">+ Adicionar</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-cc-muted">Nenhum produto com esses filtros.</p>
            )}
          </div>

          {/* a fila */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-cc-muted">
              Fila ({fila.length})
            </p>
            {fila.length === 0 ? (
              <p className="text-sm text-cc-muted">Nenhum produto na fila ainda.</p>
            ) : (
              <ol className="space-y-2">
                {fila.map((id, i) => {
                  const p = porId[id];
                  const noAr = atual && !atual.futuro && atual.idx === i;
                  return (
                    <li
                      key={`${id}-${i}`}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                        noAr ? "border-cc-yellow-dark bg-cc-yellow/15" : "border-cc-line bg-white"
                      }`}
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cc-ink text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p?.imagem_url || "https://placehold.co/40x40/FFF8EC/211C15?text=CC"}
                        alt=""
                        className="h-9 w-9 shrink-0 rounded object-cover"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm text-cc-ink">
                        {p?.nome || (
                          <span className="text-red-600">produto removido (tire da fila)</span>
                        )}
                        {noAr ? (
                          <span className="ml-2 rounded-full bg-cc-yellow px-2 py-0.5 text-[10px] font-bold text-cc-ink">
                            NO AR
                          </span>
                        ) : null}
                      </span>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => mover(i, -1)}
                          disabled={i === 0}
                          aria-label="Mover para cima"
                          className="grid h-7 w-7 place-items-center rounded-lg border border-cc-line text-cc-ink hover:bg-cc-cream disabled:opacity-40"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => mover(i, 1)}
                          disabled={i === fila.length - 1}
                          aria-label="Mover para baixo"
                          className="grid h-7 w-7 place-items-center rounded-lg border border-cc-line text-cc-ink hover:bg-cc-cream disabled:opacity-40"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => remover(id)}
                          aria-label="Remover da fila"
                          className="grid h-7 w-7 place-items-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {/* ações */}
          <div className="flex flex-wrap items-center gap-2 border-t border-cc-line pt-4">
            <button
              onClick={salvar}
              disabled={salvando}
              className="bg-cc-yellow px-5 py-2.5 text-sm font-bold text-cc-ink transition hover:bg-cc-yellow-dark active:translate-y-px disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Salvar fila"}
            </button>
            <button
              onClick={desativar}
              disabled={salvando}
              className="border border-cc-line px-4 py-2.5 text-sm font-medium text-cc-muted hover:text-cc-ink"
            >
              Voltar ao automático
            </button>
            {msg ? <span className="text-sm text-cc-ink">{msg}</span> : null}
          </div>
        </div>
      )}
    </div>
  );
}
