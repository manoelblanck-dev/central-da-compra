"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CATEGORIAS, PLATAFORMAS, formatarPreco, nomeCategoria } from "@/lib/constantes";
import Metrica from "@/components/admin/Metrica";
import AbaBotao from "@/components/admin/AbaBotao";
import FormProduto from "@/components/admin/FormProduto";
import FormLote from "@/components/admin/FormLote";
import SecaoDesempenho from "@/components/admin/SecaoDesempenho";
import SecaoOfertaDia from "@/components/admin/SecaoOfertaDia";
import SecaoDisparos from "@/components/admin/SecaoDisparos";
import SecaoCategorias from "@/components/admin/SecaoCategorias";
import SecaoProximoJogo from "@/components/admin/SecaoProximoJogo";
import SecaoCupons from "@/components/admin/SecaoCupons";

const PRODUTO_VAZIO = {
  nome: "",
  descricao: "",
  preco: "",
  preco_antigo: "",
  imagem_url: "",
  link_afiliado: "",
  plataforma: "shopee",
  categoria: "outros",
  subcategorias: [],
  destaque: false,
  nota: "",
  avaliacoes: "",
  comissao_percent: "",
  imagens: [],
};

export default function AdminPage() {
  const router = useRouter();
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState(null); // null = fechado; objeto = abrindo
  const [lote, setLote] = useState(false); // modal de adicionar vários
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [selecionados, setSelecionados] = useState([]); // ids marcados na tabela
  const [excluindoLote, setExcluindoLote] = useState(false);
  const [atualizandoImagens, setAtualizandoImagens] = useState(false);
  const [atualizandoTudo, setAtualizandoTudo] = useState(false);
  const [aba, setAba] = useState("produtos"); // produtos | categorias | cupons | jogo
  const [busca, setBusca] = useState(""); // busca na tabela de produtos
  const [ordem, setOrdem] = useState("recentes"); // ordenação da tabela
  const [filtro, setFiltro] = useState("todos"); // todos | incompletos | destaque | semdestaque
  const [filtroCategoria, setFiltroCategoria] = useState(""); // "" = todas
  const [loteCategoria, setLoteCategoria] = useState(""); // edição em lote: categoria
  const [loteComissao, setLoteComissao] = useState(""); // edição em lote: comissão %
  const [aplicandoLote, setAplicandoLote] = useState(false);
  // Lista completa de categorias (fixas + criadas pelo usuário).
  const [categorias, setCategorias] = useState(CATEGORIAS);
  // Mapa de subcategorias { catSlug: [{ slug, nome }] }.
  const [subcategorias, setSubcategorias] = useState({});
  // Modo da loja: "dropshipping" esconde os campos de afiliado (comissão, ganho,
  // botões do Mercado Livre). Guardado no config pra valer pra todos.
  const [modoDrop, setModoDrop] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const { data } = await supabase
      .from("produtos")
      .select("*")
      .order("criado_em", { ascending: false });
    setProdutos(data || []);
    setCarregando(false);
  }, []);

  // Busca as categorias criadas pelo usuário (config) e junta com as fixas.
  const carregarCategorias = useCallback(async () => {
    try {
      const res = await fetch("/api/config?chave=categorias");
      const data = await res.json();
      const extras = Array.isArray(data?.valor) ? data.valor : [];
      const fixos = new Set(CATEGORIAS.map((c) => c.slug));
      const limpos = extras
        .filter((c) => c && c.slug && c.nome && !fixos.has(c.slug))
        .map((c) => ({ slug: c.slug, nome: c.nome, emoji: c.emoji || "🏷️" }));
      setCategorias([...CATEGORIAS, ...limpos]);
    } catch {
      setCategorias(CATEGORIAS);
    }
  }, []);

  // Busca o mapa de subcategorias (config) pra usar no formulário.
  const carregarSubcategorias = useCallback(async () => {
    try {
      const res = await fetch("/api/config?chave=subcategorias");
      const data = await res.json();
      const v = data?.valor;
      setSubcategorias(v && typeof v === "object" && !Array.isArray(v) ? v : {});
    } catch {
      setSubcategorias({});
    }
  }, []);

  // Lê o modo da loja (afiliado x dropshipping).
  const carregarModo = useCallback(async () => {
    try {
      const res = await fetch("/api/config?chave=modo_loja");
      const data = await res.json();
      setModoDrop(data?.valor === "dropshipping");
    } catch {
      setModoDrop(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    carregarCategorias();
    carregarSubcategorias();
    carregarModo();
  }, [carregar, carregarCategorias, carregarSubcategorias, carregarModo]);

  // Troca o modo da loja e salva no config (vale pra todos os dispositivos).
  async function alternarModo(drop) {
    setModoDrop(drop);
    if (drop && ordem === "ganho") setOrdem("recentes");
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chave: "modo_loja", valor: drop ? "dropshipping" : "afiliado" }),
      });
    } catch {
      /* ignora */
    }
  }

  function novo() {
    setErro("");
    setForm({ ...PRODUTO_VAZIO });
  }

  function editar(p) {
    setErro("");
    setForm({
      ...p,
      preco: p.preco ?? "",
      preco_antigo: p.preco_antigo ?? "",
      descricao: p.descricao ?? "",
      imagem_url: p.imagem_url ?? "",
      nota: p.nota ?? "",
      avaliacoes: p.avaliacoes ?? "",
      comissao_percent: p.comissao_percent ?? "",
      subcategorias: Array.isArray(p.subcategorias)
        ? p.subcategorias
        : p.subcategoria
        ? [p.subcategoria]
        : [],
      imagens: Array.isArray(p.imagens) ? p.imagens : [],
    });
  }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    const editando = !!form.id;
    const url = editando ? `/api/produtos/${form.id}` : "/api/produtos";
    const metodo = editando ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || "Erro ao salvar.");
      } else {
        setForm(null);
        await carregar();
      }
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setSalvando(false);
    }
  }

  // Abre o formulário com os dados de um produto, mas SEM id — assim salvar
  // cria um novo (cópia), em vez de editar o original.
  function duplicar(p) {
    setErro("");
    setForm({
      ...PRODUTO_VAZIO,
      ...p,
      id: undefined,
      nome: `${p.nome || ""} (cópia)`,
      preco: p.preco ?? "",
      preco_antigo: p.preco_antigo ?? "",
      descricao: p.descricao ?? "",
      imagem_url: p.imagem_url ?? "",
      nota: p.nota ?? "",
      avaliacoes: p.avaliacoes ?? "",
      comissao_percent: p.comissao_percent ?? "",
      subcategorias: Array.isArray(p.subcategorias)
        ? p.subcategorias
        : p.subcategoria
        ? [p.subcategoria]
        : [],
      imagens: Array.isArray(p.imagens) ? p.imagens : [],
    });
  }

  // Liga/desliga o destaque de um produto (entra/sai de "Ofertas da Semana")
  // direto pela tabela, sem abrir o formulário. Usa o PATCH em lote (1 id).
  async function toggleDestaque(p) {
    try {
      const res = await fetch("/api/produtos/lote", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [p.id], destaque: !p.destaque }),
      });
      if (res.ok) {
        // Atualiza na hora, sem recarregar tudo.
        setProdutos((lista) =>
          lista.map((x) => (x.id === p.id ? { ...x, destaque: !p.destaque } : x))
        );
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.erro || "Não foi possível alterar o destaque.");
      }
    } catch {
      alert("Erro de conexão.");
    }
  }

  // Aplica um campo (categoria ou comissão) a todos os produtos selecionados.
  async function aplicarEmLote(campos) {
    if (selecionados.length === 0) return;
    setAplicandoLote(true);
    try {
      const res = await fetch("/api/produtos/lote", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selecionados, ...campos }),
      });
      if (res.ok) {
        setSelecionados([]);
        setLoteCategoria("");
        setLoteComissao("");
        await carregar();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.erro || "Não foi possível aplicar a alteração.");
      }
    } catch {
      alert("Erro de conexão.");
    } finally {
      setAplicandoLote(false);
    }
  }

  async function excluir(p) {
    if (!confirm(`Excluir "${p.nome}"? Essa ação não pode ser desfeita.`)) return;
    const res = await fetch(`/api/produtos/${p.id}`, { method: "DELETE" });
    if (res.ok) carregar();
    else alert("Não foi possível excluir.");
  }

  function toggleSelecionado(id) {
    setSelecionados((sel) =>
      sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
    );
  }

  function toggleTodos() {
    const ids = produtosExibidos.map((p) => p.id);
    setSelecionados((sel) => (ids.every((id) => sel.includes(id)) ? [] : ids));
  }

  async function excluirSelecionados() {
    if (selecionados.length === 0) return;
    if (
      !confirm(
        `Excluir ${selecionados.length} produto(s) selecionado(s)? Essa ação não pode ser desfeita.`
      )
    )
      return;

    setExcluindoLote(true);
    try {
      const res = await fetch("/api/produtos/lote", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selecionados }),
      });
      if (res.ok) {
        setSelecionados([]);
        await carregar();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.erro || "Não foi possível excluir os produtos selecionados.");
      }
    } catch {
      alert("Erro de conexão.");
    } finally {
      setExcluindoLote(false);
    }
  }

  async function atualizarImagensML() {
    setAtualizandoImagens(true);
    try {
      const res = await fetch("/api/produtos/atualizar-imagens", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.erro || "Não foi possível atualizar as imagens.");
      } else {
        alert(
          `Verificados: ${data.total}\nAtualizados: ${data.atualizados}\nSem dados: ${data.semDados}`
        );
        await carregar();
      }
    } catch {
      alert("Erro de conexão.");
    } finally {
      setAtualizandoImagens(false);
    }
  }

  async function atualizarTudoML() {
    setAtualizandoTudo(true);
    try {
      const res = await fetch("/api/produtos/atualizar-tudo", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.erro || "Não foi possível atualizar os produtos.");
      } else {
        let msg = `Verificados: ${data.total}\nAtualizados: ${data.atualizados}`;
        if (data.bloqueados > 0) {
          msg += `\nBloqueados pelo Mercado Livre: ${data.bloqueados}`;
        }
        if (data.semMudanca > 0) {
          msg += `\nSem mudanças: ${data.semMudanca}`;
        }
        if (data.bloqueados > 0) {
          msg +=
            "\n\nO Mercado Livre está bloqueando essas consultas automáticas. Tente atualizar manualmente esses produtos por enquanto.";
        }
        alert(msg);
        await carregar();
      }
    } catch {
      alert("Erro de conexão.");
    } finally {
      setAtualizandoTudo(false);
    }
  }

  async function sair() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const totalCliques = produtos.reduce((s, p) => s + (p.cliques || 0), 0);
  const totalDestaques = produtos.filter((p) => p.destaque).length;
  // Ganho por venda de cada produto = preço × comissão%. O potencial é a soma
  // (quanto você ganharia vendendo um de cada).
  const ganhoProduto = (p) =>
    p.preco && p.comissao_percent ? (Number(p.preco) * Number(p.comissao_percent)) / 100 : 0;
  const ganhoPotencial = produtos.reduce((s, p) => s + ganhoProduto(p), 0);

  // Tabela do painel: aplica a busca por nome e a ordenação escolhida.
  const termoBusca = busca.trim().toLowerCase();
  const ordenarTabela = (a, b) => {
    if (ordem === "cliques") return (b.cliques || 0) - (a.cliques || 0);
    if (ordem === "ganho") return ganhoProduto(b) - ganhoProduto(a);
    if (ordem === "maior") return (Number(b.preco) || 0) - (Number(a.preco) || 0);
    if (ordem === "menor") return (Number(a.preco) || 0) - (Number(b.preco) || 0);
    return new Date(b.criado_em || 0) - new Date(a.criado_em || 0); // recentes
  };
  // Produto "incompleto" = falta foto, preço ou comissão (precisa de atenção).
  const incompleto = (p) =>
    !p.imagem_url ||
    p.preco === null ||
    p.preco === undefined ||
    p.preco === "" ||
    (!modoDrop && !p.comissao_percent);
  const produtosExibidos = produtos
    .filter((p) => !termoBusca || (p.nome || "").toLowerCase().includes(termoBusca))
    .filter((p) => {
      if (filtro === "incompletos") return incompleto(p);
      if (filtro === "destaque") return !!p.destaque;
      if (filtro === "semdestaque") return !p.destaque;
      return true;
    })
    .filter((p) => !filtroCategoria || p.categoria === filtroCategoria)
    .sort(ordenarTabela);
  const totalIncompletos = produtos.filter(incompleto).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* topo */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="cc-mono text-3xl text-cc-ink">Painel</h1>
          <p className="text-sm text-cc-muted">Gerencie a loja</p>
        </div>
        <button
          onClick={sair}
          className="border border-cc-line px-4 py-2.5 text-sm font-medium text-cc-muted transition hover:text-cc-ink"
        >
          Sair
        </button>
      </div>

      {/* métricas */}
      <div className={`mt-6 grid grid-cols-2 gap-3 ${modoDrop ? "sm:grid-cols-3" : "sm:grid-cols-4"}`}>
        <Metrica rotulo="Produtos" valor={produtos.length} />
        <Metrica rotulo="Em destaque" valor={totalDestaques} />
        <Metrica rotulo="Cliques" valor={totalCliques} />
        {!modoDrop ? (
          <Metrica
            rotulo="Ganho potencial (1 de cada)"
            valor={formatarPreco(ganhoPotencial) || "R$ 0,00"}
          />
        ) : null}
      </div>

      {/* abas */}
      <div className="mt-6 flex gap-1 border-b border-cc-line">
        <AbaBotao ativo={aba === "produtos"} onClick={() => setAba("produtos")}>
          📦 Produtos
        </AbaBotao>
        <AbaBotao ativo={aba === "desempenho"} onClick={() => setAba("desempenho")}>
          📊 Desempenho
        </AbaBotao>
        <AbaBotao ativo={aba === "oferta"} onClick={() => setAba("oferta")}>
          🔥 Oferta do dia
        </AbaBotao>
        <AbaBotao ativo={aba === "disparos"} onClick={() => setAba("disparos")}>
          📣 Disparos
        </AbaBotao>
        <AbaBotao ativo={aba === "categorias"} onClick={() => setAba("categorias")}>
          🏷️ Categorias
        </AbaBotao>
        <AbaBotao ativo={aba === "cupons"} onClick={() => setAba("cupons")}>
          🎟️ Cupons
        </AbaBotao>
        <AbaBotao ativo={aba === "jogo"} onClick={() => setAba("jogo")}>
          ⚽ Próximo jogo
        </AbaBotao>
      </div>

      {/* aba: produtos */}
      {aba === "produtos" ? (
        <div className="mt-4">
          {/* modo da loja: afiliado x dropshipping */}
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-cc-line bg-cc-cream/40 px-3 py-2">
            <span className="text-sm font-medium text-cc-ink">Modo da loja:</span>
            <div className="flex gap-1">
              <button
                onClick={() => alternarModo(false)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  !modoDrop ? "bg-cc-ink text-white" : "text-cc-muted hover:bg-cc-cream"
                }`}
              >
                Afiliado
              </button>
              <button
                onClick={() => alternarModo(true)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  modoDrop ? "bg-cc-ink text-white" : "text-cc-muted hover:bg-cc-cream"
                }`}
              >
                Dropshipping
              </button>
            </div>
            <span className="text-xs text-cc-muted">
              {modoDrop
                ? "Campos de afiliado (comissão, ganho, Mercado Livre) escondidos."
                : "Mostrando os campos de afiliado (comissão, ganho, Mercado Livre)."}
            </span>
          </div>

          {/* ações de produto */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={novo}
              className="bg-cc-yellow px-5 py-2.5 text-sm font-bold text-cc-ink transition hover:bg-cc-yellow-dark"
            >
              + Novo produto
            </button>
            <button
              onClick={() => { setErro(""); setLote(true); }}
              className="border border-cc-line px-4 py-2.5 text-sm font-medium text-cc-ink transition hover:bg-cc-cream"
            >
              + Adicionar vários
            </button>
            {!modoDrop ? (
              <>
                <button
                  onClick={atualizarImagensML}
                  disabled={atualizandoImagens}
                  className="border border-cc-line px-4 py-2.5 text-sm font-medium text-cc-ink transition hover:bg-cc-cream disabled:opacity-60"
                >
                  {atualizandoImagens ? "Atualizando imagens..." : "Atualizar imagens (Mercado Livre)"}
                </button>
                <button
                  onClick={atualizarTudoML}
                  disabled={atualizandoTudo}
                  className="bg-cc-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-60"
                >
                  {atualizandoTudo ? "Atualizando..." : "Atualizar tudo agora (preço, nota, avaliações)"}
                </button>
              </>
            ) : null}
          </div>

          {/* ações em lote */}
          {selecionados.length > 0 ? (
            <div className="mt-4 space-y-2.5 rounded-xl border border-cc-line bg-cc-cream/50 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-cc-ink">
                  {selecionados.length} produto(s) selecionado(s)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelecionados([])}
                    className="rounded-lg border border-cc-line bg-white px-3 py-1.5 text-xs font-medium text-cc-ink hover:bg-cc-cream"
                  >
                    Limpar seleção
                  </button>
                  <button
                    onClick={excluirSelecionados}
                    disabled={excluindoLote}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {excluindoLote ? "Excluindo..." : "Excluir selecionados"}
                  </button>
                </div>
              </div>

              {/* aplicar categoria / comissão aos selecionados */}
              <div className="flex flex-wrap items-center gap-2 border-t border-cc-line pt-2.5">
                <span className="text-xs font-medium text-cc-muted">Aplicar a todos:</span>
                <select
                  value={loteCategoria}
                  onChange={(e) => setLoteCategoria(e.target.value)}
                  className="rounded-lg border border-cc-line bg-white px-2.5 py-1.5 text-xs outline-none focus:border-cc-yellow"
                >
                  <option value="">Categoria...</option>
                  {categorias.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.nome}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => aplicarEmLote({ categoria: loteCategoria })}
                  disabled={aplicandoLote || !loteCategoria}
                  className="rounded-lg border border-cc-line bg-white px-3 py-1.5 text-xs font-medium text-cc-ink hover:bg-cc-cream disabled:opacity-50"
                >
                  Aplicar
                </button>
                {!modoDrop ? (
                  <>
                    <span className="ml-2 text-xs text-cc-line">|</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={loteComissao}
                      onChange={(e) => setLoteComissao(e.target.value)}
                      placeholder="Comissão %"
                      className="w-28 rounded-lg border border-cc-line bg-white px-2.5 py-1.5 text-xs outline-none focus:border-cc-yellow"
                    />
                    <button
                      onClick={() => aplicarEmLote({ comissao_percent: loteComissao })}
                      disabled={aplicandoLote || loteComissao === ""}
                      className="rounded-lg border border-cc-line bg-white px-3 py-1.5 text-xs font-medium text-cc-ink hover:bg-cc-cream disabled:opacity-50"
                    >
                      Aplicar
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* busca + ordenação */}
          {produtos.length > 0 ? (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar produto pelo nome..."
                className="flex-1 rounded-xl border border-cc-line px-3 py-2.5 text-sm outline-none focus:border-cc-yellow focus:ring-2 focus:ring-cc-yellow/30"
              />
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="rounded-xl border border-cc-line px-3 py-2.5 text-sm outline-none focus:border-cc-yellow"
              >
                <option value="">Todas as categorias</option>
                {categorias.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.nome}
                  </option>
                ))}
              </select>
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="rounded-xl border border-cc-line px-3 py-2.5 text-sm outline-none focus:border-cc-yellow"
              >
                <option value="todos">Todos</option>
                <option value="destaque">Em destaque</option>
                <option value="semdestaque">Sem destaque</option>
                <option value="incompletos">
                  Incompletos{totalIncompletos > 0 ? ` (${totalIncompletos})` : ""}
                </option>
              </select>
              <select
                value={ordem}
                onChange={(e) => setOrdem(e.target.value)}
                className="rounded-xl border border-cc-line px-3 py-2.5 text-sm outline-none focus:border-cc-yellow"
              >
                <option value="recentes">Mais recentes</option>
                <option value="cliques">Mais clicados</option>
                {!modoDrop ? <option value="ganho">Maior ganho/venda</option> : null}
                <option value="maior">Maior preço</option>
                <option value="menor">Menor preço</option>
              </select>
            </div>
          ) : null}

          {/* tabela */}
          <div className="mt-3 overflow-hidden border border-cc-line bg-white">
            {carregando ? (
              <p className="px-4 py-10 text-center text-sm text-cc-muted">Carregando...</p>
            ) : produtos.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-cc-muted">
                Nenhum produto ainda. Clique em “Novo produto” para começar.
              </p>
            ) : produtosExibidos.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-cc-muted">
                Nenhum produto encontrado para “{busca}”.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-cc-line bg-cc-cream/60 text-xs uppercase tracking-wide text-cc-muted">
                    <tr>
                      <th className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={
                            produtosExibidos.length > 0 &&
                            produtosExibidos.every((p) => selecionados.includes(p.id))
                          }
                          onChange={toggleTodos}
                          className="h-4 w-4 accent-cc-yellow"
                          aria-label="Selecionar todos"
                        />
                      </th>
                      <th className="px-4 py-3 font-medium">Produto</th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">Categoria</th>
                      <th className="px-4 py-3 font-medium">Preço</th>
                      {!modoDrop ? (
                        <th className="hidden px-4 py-3 font-medium lg:table-cell">Ganho/venda</th>
                      ) : null}
                      <th className="hidden px-4 py-3 font-medium sm:table-cell">Cliques</th>
                      <th className="px-4 py-3 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosExibidos.map((p) => (
                      <tr key={p.id} className="border-b border-cc-line last:border-0">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selecionados.includes(p.id)}
                            onChange={() => toggleSelecionado(p.id)}
                            className="h-4 w-4 accent-cc-yellow"
                            aria-label={`Selecionar ${p.nome}`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.imagem_url || "https://placehold.co/80x80/FFF8EC/211C15?text=CC"}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-lg object-cover"
                            />
                            <div className="min-w-0 max-w-[180px] sm:max-w-[260px] lg:max-w-[340px]">
                              <p className="truncate font-medium text-cc-ink">{p.nome}</p>
                              <p className="truncate text-xs text-cc-muted">
                                {modoDrop
                                  ? nomeCategoria(p.categoria, categorias)
                                  : PLATAFORMAS.find((x) => x.id === p.plataforma)?.nome || p.plataforma}
                                {p.destaque ? " · ⭐ destaque" : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-cc-muted md:table-cell">
                          {nomeCategoria(p.categoria, categorias)}
                        </td>
                        <td className="px-4 py-3 text-cc-ink">{formatarPreco(p.preco) || "—"}</td>
                        {!modoDrop ? (
                          <td className="hidden px-4 py-3 lg:table-cell">
                            {p.comissao_percent ? (
                              <span className="text-br-green">
                                {formatarPreco(ganhoProduto(p))}
                                <span className="ml-1 text-xs text-cc-muted">
                                  ({p.comissao_percent}%)
                                </span>
                              </span>
                            ) : (
                              <span className="text-cc-muted">—</span>
                            )}
                          </td>
                        ) : null}
                        <td className="hidden px-4 py-3 text-cc-muted sm:table-cell">{p.cliques || 0}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => toggleDestaque(p)}
                              title={
                                p.destaque
                                  ? "Tirar de “Ofertas da Semana”"
                                  : "Colocar em “Ofertas da Semana”"
                              }
                              aria-label={p.destaque ? "Tirar destaque" : "Destacar"}
                              className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                                p.destaque
                                  ? "border-cc-yellow-dark bg-cc-yellow text-cc-ink"
                                  : "border-cc-line text-cc-muted hover:bg-cc-cream"
                              }`}
                            >
                              {p.destaque ? "★" : "☆"}
                            </button>
                            <button
                              onClick={() => editar(p)}
                              className="rounded-lg border border-cc-line px-3 py-1.5 text-xs font-medium text-cc-ink hover:bg-cc-cream"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => duplicar(p)}
                              className="rounded-lg border border-cc-line px-3 py-1.5 text-xs font-medium text-cc-ink hover:bg-cc-cream"
                            >
                              Duplicar
                            </button>
                            <button
                              onClick={() => excluir(p)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* aba: desempenho */}
      {aba === "desempenho" ? <SecaoDesempenho /> : null}

      {/* aba: oferta do dia (fila manual) */}
      {aba === "oferta" ? (
        <SecaoOfertaDia
          produtos={produtos}
          categorias={categorias}
          subcategorias={subcategorias}
        />
      ) : null}

      {/* aba: disparos no telegram */}
      {aba === "disparos" ? (
        <SecaoDisparos
          produtos={produtos}
          categorias={categorias}
          subcategorias={subcategorias}
        />
      ) : null}

      {/* aba: categorias */}
      {aba === "categorias" ? (
        <SecaoCategorias categorias={categorias} aoMudar={carregarCategorias} />
      ) : null}

      {/* aba: cupons */}
      {aba === "cupons" ? <SecaoCupons /> : null}

      {/* aba: próximo jogo */}
      {aba === "jogo" ? <SecaoProximoJogo /> : null}

      {/* formulário (modal) */}
      {form ? (
        <FormProduto
          form={form}
          setForm={setForm}
          salvar={salvar}
          fechar={() => setForm(null)}
          salvando={salvando}
          erro={erro}
          categorias={categorias}
          subcategorias={subcategorias}
          modoDrop={modoDrop}
        />
      ) : null}

      {/* modal de adicionar vários */}
      {lote ? (
        <FormLote
          categorias={categorias}
          modoDrop={modoDrop}
          fechar={() => setLote(false)}
          aoConcluir={() => {
            setLote(false);
            carregar();
          }}
        />
      ) : null}
    </div>
  );
}

