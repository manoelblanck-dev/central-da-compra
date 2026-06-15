"use client";

import { useState, useEffect, useCallback } from "react";
import { CATEGORIAS, gerarSlug } from "@/lib/constantes";

export default function SecaoCategorias({ categorias = CATEGORIAS, aoMudar }) {
  const [custom, setCustom] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [nome, setNome] = useState("");
  const [emoji, setEmoji] = useState("");
  const [msg, setMsg] = useState("");

  // Subcategorias: mapa { catSlug: [{ slug, nome }] }.
  const [subMapa, setSubMapa] = useState({});
  const [catSel, setCatSel] = useState("");
  const [subNome, setSubNome] = useState("");
  const [salvandoSub, setSalvandoSub] = useState(false);
  const [msgSub, setMsgSub] = useState("");

  const fixas = CATEGORIAS;

  const carregar = useCallback(async () => {
    try {
      const res = await fetch("/api/config?chave=categorias");
      const data = await res.json();
      setCustom(
        Array.isArray(data?.valor) ? data.valor.filter((c) => c && c.slug && c.nome) : []
      );
    } catch {
      /* ignora */
    }
    setCarregando(false);
  }, []);

  const carregarSub = useCallback(async () => {
    try {
      const res = await fetch("/api/config?chave=subcategorias");
      const data = await res.json();
      const v = data?.valor;
      setSubMapa(v && typeof v === "object" && !Array.isArray(v) ? v : {});
    } catch {
      /* ignora */
    }
  }, []);

  useEffect(() => {
    carregar();
    carregarSub();
  }, [carregar, carregarSub]);

  async function persistir(nova) {
    setSalvando(true);
    setMsg("");
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chave: "categorias", valor: nova }),
      });
      const data = await res.json();
      if (res.ok) {
        setCustom(nova);
        setMsg("✅ Categorias atualizadas!");
        aoMudar?.();
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
    const n = nome.trim();
    if (!n) {
      setMsg("Informe o nome da categoria.");
      return;
    }
    const slug = gerarSlug(n);
    if (!slug) {
      setMsg("Nome inválido — use letras ou números.");
      return;
    }
    if (fixas.some((c) => c.slug === slug)) {
      setMsg("Já existe uma categoria padrão parecida com essa.");
      return;
    }
    if (custom.some((c) => c.slug === slug)) {
      setMsg("Você já criou essa categoria.");
      return;
    }
    persistir([...custom, { slug, nome: n, emoji: emoji.trim() || "🏷️" }]);
    setNome("");
    setEmoji("");
  }

  function remover(slug) {
    if (
      !confirm(
        "Remover esta categoria? Os produtos que estão nela continuam existindo, mas a categoria some dos menus."
      )
    )
      return;
    persistir(custom.filter((c) => c.slug !== slug));
  }

  async function persistirSub(novo) {
    setSalvandoSub(true);
    setMsgSub("");
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chave: "subcategorias", valor: novo }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubMapa(novo);
        setMsgSub("✅ Subcategorias atualizadas!");
        aoMudar?.();
      } else {
        setMsgSub(data.erro || "Erro ao salvar.");
      }
    } catch {
      setMsgSub("Erro de conexão.");
    } finally {
      setSalvandoSub(false);
    }
  }

  function adicionarSub() {
    if (!catSel) {
      setMsgSub("Escolha uma categoria primeiro.");
      return;
    }
    const n = subNome.trim();
    if (!n) {
      setMsgSub("Informe o nome da subcategoria.");
      return;
    }
    const slug = gerarSlug(n);
    if (!slug) {
      setMsgSub("Nome inválido — use letras ou números.");
      return;
    }
    const atuais = Array.isArray(subMapa[catSel]) ? subMapa[catSel] : [];
    if (atuais.some((s) => s.slug === slug)) {
      setMsgSub("Essa subcategoria já existe nessa categoria.");
      return;
    }
    persistirSub({ ...subMapa, [catSel]: [...atuais, { slug, nome: n }] });
    setSubNome("");
  }

  function removerSub(catSlug, subSlug) {
    if (
      !confirm(
        "Remover esta subcategoria? Os produtos nela continuam existindo, mas a subcategoria some dos filtros."
      )
    )
      return;
    const restantes = (subMapa[catSlug] || []).filter((s) => s.slug !== subSlug);
    const novo = { ...subMapa };
    if (restantes.length) novo[catSlug] = restantes;
    else delete novo[catSlug];
    persistirSub(novo);
  }

  const nomeCat = (slug) => categorias.find((c) => c.slug === slug)?.nome || slug;

  const campo =
    "w-full rounded-xl border border-cc-line px-3 py-2.5 text-sm outline-none focus:border-cc-yellow focus:ring-2 focus:ring-cc-yellow/30";

  return (
    <div className="mt-4 border border-cc-line bg-white p-5">
      <h2 className="cc-mono text-xl text-cc-ink">🏷️ Categorias</h2>
      <p className="mt-1 text-xs text-cc-muted">
        Crie categorias suas além das padrão. Depois é só escolher a categoria ao cadastrar um
        produto (inclusive em “Adicionar vários”). Categorias sem produto não aparecem no site.
      </p>

      {/* criar nova */}
      <div className="mt-4 flex flex-wrap items-end gap-2">
        <div className="w-20">
          <label className="mb-1 block text-xs font-medium text-cc-ink">Ícone</label>
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className={campo}
            placeholder="🎮"
            maxLength={2}
          />
        </div>
        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-xs font-medium text-cc-ink">Nome da categoria</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adicionar();
              }
            }}
            className={campo}
            placeholder="Ex.: Games, Ferramentas, Moda Praia..."
          />
        </div>
        <button
          onClick={adicionar}
          disabled={salvando}
          className="bg-cc-yellow px-5 py-2.5 text-sm font-bold text-cc-ink transition hover:bg-cc-yellow-dark disabled:opacity-60"
        >
          {salvando ? "Salvando..." : "+ Criar"}
        </button>
      </div>
      {nome.trim() ? (
        <p className="mt-1 text-xs text-cc-muted">
          Atalho gerado: <span className="font-mono">{gerarSlug(nome) || "—"}</span>
        </p>
      ) : null}
      {msg ? <p className="mt-2 text-sm text-cc-ink">{msg}</p> : null}

      {/* suas categorias */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-cc-muted">
          Suas categorias
        </p>
        {carregando ? (
          <p className="text-sm text-cc-muted">Carregando...</p>
        ) : custom.length === 0 ? (
          <p className="text-sm text-cc-muted">Você ainda não criou nenhuma categoria.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {custom.map((c) => (
              <span
                key={c.slug}
                className="inline-flex items-center gap-2 rounded-full border border-cc-line bg-cc-cream/50 px-3 py-1.5 text-sm text-cc-ink"
              >
                <span>{c.emoji || "🏷️"}</span>
                {c.nome}
                <button
                  onClick={() => remover(c.slug)}
                  disabled={salvando}
                  aria-label={`Remover ${c.nome}`}
                  className="text-cc-muted hover:text-red-600"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* categorias padrão (referência) */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-cc-muted">
          Categorias padrão (sempre disponíveis)
        </p>
        <div className="flex flex-wrap gap-2">
          {fixas.map((c) => (
            <span
              key={c.slug}
              className="inline-flex items-center gap-2 rounded-full border border-cc-line bg-white px-3 py-1.5 text-sm text-cc-muted"
            >
              {c.nome}
            </span>
          ))}
        </div>
      </div>

      {/* subcategorias */}
      <div className="mt-8 border-t border-cc-line pt-6">
        <h3 className="cc-mono text-lg text-cc-ink">📂 Subcategorias</h3>
        <p className="mt-1 text-xs text-cc-muted">
          Divida uma categoria em partes (ex.: Moda → Camisas, Vestidos, Bolsas, Tênis). No site,
          elas viram filtros no topo da página da categoria. Depois é só escolhê-las ao cadastrar o
          produto.
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-2">
          <div className="min-w-[160px]">
            <label className="mb-1 block text-xs font-medium text-cc-ink">Categoria</label>
            <select
              value={catSel}
              onChange={(e) => {
                setCatSel(e.target.value);
                setMsgSub("");
              }}
              className={campo}
            >
              <option value="">Escolha...</option>
              {categorias.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs font-medium text-cc-ink">
              Nome da subcategoria
            </label>
            <input
              value={subNome}
              onChange={(e) => setSubNome(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  adicionarSub();
                }
              }}
              className={campo}
              placeholder="Ex.: Camisas, Vestidos, Bolsas..."
              disabled={!catSel}
            />
          </div>
          <button
            onClick={adicionarSub}
            disabled={salvandoSub || !catSel}
            className="bg-cc-yellow px-5 py-2.5 text-sm font-bold text-cc-ink transition hover:bg-cc-yellow-dark disabled:opacity-60"
          >
            {salvandoSub ? "Salvando..." : "+ Criar"}
          </button>
        </div>
        {msgSub ? <p className="mt-2 text-sm text-cc-ink">{msgSub}</p> : null}

        {catSel ? (
          <div className="mt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-cc-muted">
              Subcategorias de {nomeCat(catSel)}
            </p>
            {(subMapa[catSel] || []).length === 0 ? (
              <p className="text-sm text-cc-muted">Nenhuma ainda nessa categoria.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(subMapa[catSel] || []).map((s) => (
                  <span
                    key={s.slug}
                    className="inline-flex items-center gap-2 rounded-full border border-cc-line bg-cc-cream/50 px-3 py-1.5 text-sm text-cc-ink"
                  >
                    {s.nome}
                    <button
                      onClick={() => removerSub(catSel, s.slug)}
                      disabled={salvandoSub}
                      aria-label={`Remover ${s.nome}`}
                      className="text-cc-muted hover:text-red-600"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

