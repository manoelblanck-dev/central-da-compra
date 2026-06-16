"use client";

import { useEffect, useMemo, useState } from "react";
import { formatarPreco } from "@/lib/constantes";

export default function SecaoDisparos({ produtos = [], categorias = [], subcategorias = {} }) {
  const [ativo, setAtivo] = useState(false);
  const [fila, setFila] = useState([]); // ids, em ordem
  const [horas, setHoras] = useState(3);
  const [repetir, setRepetir] = useState(true);
  const [ultimoEnvio, setUltimoEnvio] = useState(null); // ISO (só leitura/prévia)
  const [idx, setIdx] = useState(0);

  const [busca, setBusca] = useState("");
  const [fCat, setFCat] = useState("");
  const [fSub, setFSub] = useState("");
  const [ordem, setOrdem] = useState("cliques");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [testando, setTestando] = useState(null); // id sendo testado
  const [msg, setMsg] = useState("");
  const [agora, setAgora] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/config?chave=disparos_telegram");
        const data = await res.json();
        const v = data?.valor;
        if (v && typeof v === "object") {
          setAtivo(!!v.ativo);
          setFila(Array.isArray(v.produtos) ? v.produtos.filter(Boolean) : []);
          setHoras(Number(v.horas) > 0 ? Number(v.horas) : 3);
          setRepetir(v.repetir !== false);
          setUltimoEnvio(v.ultimo_envio || null);
          setIdx(Number.isInteger(v.idx) ? v.idx : 0);
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

  const catNome = useMemo(() => {
    const m = {};
    for (const c of categorias) m[c.slug] = c.nome;
    return m;
  }, [categorias]);

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

  async function salvar() {
    setMsg("");
    setSalvando(true);
    // Ao salvar, a fila recomeça do topo e o 1º disparo sai no próximo ciclo do
    // cron (até ~1h). Por isso zeramos idx e o "último envio".
    const valor = {
      ativo,
      produtos: fila,
      horas: Number(horas) > 0 ? Number(horas) : 3,
      repetir,
      idx: 0,
      ultimo_envio: null,
    };
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chave: "disparos_telegram", valor }),
      });
      const data = await res.json();
      if (res.ok) {
        setIdx(0);
        setUltimoEnvio(null);
        setMsg(
          ativo
            ? "✅ Salvo! Os disparos estão LIGADOS — o 1º sai no próximo ciclo (até 1h)."
            : "✅ Salvo. Os disparos estão DESLIGADOS."
        );
      } else {
        setMsg(data.erro || "Erro ao salvar.");
      }
    } catch {
      setMsg("Erro de conexão.");
    } finally {
      setSalvando(false);
    }
  }

  async function enviarAgora(id) {
    setMsg("");
    setTestando(id);
    try {
      const res = await fetch("/api/admin/disparo-teste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      setMsg(res.ok ? "📤 Enviado pro Telegram! Confira o grupo/canal." : data.erro || "Falha ao enviar.");
    } catch {
      setMsg("Erro de conexão.");
    } finally {
      setTestando(null);
    }
  }

  // Prévia: quando sai o próximo disparo.
  const intervaloMs = (Number(horas) > 0 ? Number(horas) : 3) * 3600 * 1000;
  const proximoEm = (() => {
    if (!ativo || fila.length === 0) return null;
    if (!ultimoEnvio) return 0; // sai no próximo ciclo
    const passou = agora - Date.parse(ultimoEnvio);
    return Math.max(0, intervaloMs - passou);
  })();
  function fmtFalta(ms) {
    if (ms <= 0) return "no próximo ciclo (até 1h)";
    let d = ms;
    const h = Math.floor(d / 3600000);
    d -= h * 3600000;
    const m = Math.floor(d / 60000);
    return h > 0 ? `em ~${h}h ${m}min` : `em ~${m}min`;
  }

  const subDaCat = fCat && Array.isArray(subcategorias[fCat]) ? subcategorias[fCat] : [];
  const naFila = useMemo(() => new Set(fila), [fila]);
  const termo = busca.trim().toLowerCase();
  const ganho = (p) =>
    p.preco && p.comissao_percent ? (Number(p.preco) * Number(p.comissao_percent)) / 100 : 0;

  function ordenar(a, b) {
    if (ordem === "maior") return (Number(b.preco) || 0) - (Number(a.preco) || 0);
    if (ordem === "menor") return (Number(a.preco) || 0) - (Number(b.preco) || 0);
    if (ordem === "comissao_maior")
      return (Number(b.comissao_percent) || 0) - (Number(a.comissao_percent) || 0);
    if (ordem === "ganho") return ganho(b) - ganho(a);
    if (ordem === "avaliacao") return (Number(b.nota) || 0) - (Number(a.nota) || 0);
    if (ordem === "recentes") return new Date(b.criado_em || 0) - new Date(a.criado_em || 0);
    return (b.cliques || 0) - (a.cliques || 0);
  }

  const disponiveis = produtos
    .filter((p) => !naFila.has(p.id))
    .filter((p) => !termo || (p.nome || "").toLowerCase().includes(termo))
    .filter((p) => !fCat || p.categoria === fCat)
    .filter((p) => !fSub || (Array.isArray(p.subcategorias) && p.subcategorias.includes(fSub)))
    .sort(ordenar);
  const visiveis = disponiveis.slice(0, 50);

  return (
    <div className="mt-4 border border-cc-line bg-white p-5">
      <h2 className="cc-mono text-xl text-cc-ink">📣 Disparos no Telegram</h2>
      <p className="mt-1 text-xs text-cc-muted">
        Monte uma fila de produtos: a cada X horas, o bot posta o próximo no seu grupo/canal do
        Telegram, automaticamente. Para funcionar, o bot precisa estar configurado na Vercel
        (TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID).
      </p>

      {carregando ? (
        <p className="mt-4 text-sm text-cc-muted">Carregando...</p>
      ) : (
        <div className="mt-4 space-y-5">
          {/* liga/desliga + prévia */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cc-line bg-cc-cream/50 px-4 py-3">
            <label className="flex items-center gap-2.5 text-sm font-semibold text-cc-ink">
              <input
                type="checkbox"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                className="h-4 w-4 accent-cc-yellow"
              />
              Disparos automáticos {ativo ? "LIGADOS" : "DESLIGADOS"}
            </label>
            <span className="text-sm text-cc-muted">
              {!ativo
                ? "—"
                : fila.length === 0
                ? "Fila vazia"
                : (
                  <>
                    Próximo: <b className="text-cc-ink">{porId[fila[idx % fila.length]]?.nome || "—"}</b>{" "}
                    {fmtFalta(proximoEm ?? intervaloMs)}
                  </>
                )}
            </span>
          </div>

          {/* configurações */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-40">
              <label className="mb-1 block text-sm font-medium text-cc-ink">Horas entre disparos</label>
              <input
                type="number"
                min="1"
                step="1"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
                className="w-full border border-cc-line px-3 py-2 text-sm outline-none focus:border-cc-yellow"
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
          </div>

          {/* adicionar produto */}
          <div>
            <label className="mb-1 block text-sm font-medium text-cc-ink">Adicionar produto à fila</label>
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
                <option value="ganho">Maior ganho/venda</option>
                <option value="avaliacao">Melhor avaliação</option>
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
                    <span className="shrink-0 text-cc-ink">{formatarPreco(p.preco) || "—"}</span>
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
                  const proximo = ativo && i === idx % fila.length;
                  return (
                    <li
                      key={`${id}-${i}`}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                        proximo ? "border-cc-yellow-dark bg-cc-yellow/15" : "border-cc-line bg-white"
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
                        {proximo ? (
                          <span className="ml-2 rounded-full bg-cc-yellow px-2 py-0.5 text-[10px] font-bold text-cc-ink">
                            PRÓXIMO
                          </span>
                        ) : null}
                      </span>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => enviarAgora(id)}
                          disabled={testando === id || !p}
                          title="Enviar este agora (teste)"
                          aria-label="Enviar agora"
                          className="grid h-7 w-7 place-items-center rounded-lg border border-br-green/40 text-br-green hover:bg-[#F2FBF5] disabled:opacity-40"
                        >
                          {testando === id ? "…" : "📤"}
                        </button>
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
              {salvando ? "Salvando..." : "Salvar"}
            </button>
            {msg ? <span className="text-sm text-cc-ink">{msg}</span> : null}
          </div>
        </div>
      )}
    </div>
  );
}
