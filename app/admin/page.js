"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  CATEGORIAS,
  PLATAFORMAS,
  formatarPreco,
  nomeCategoria,
  detectarPlataforma,
  normalizarPlataforma,
  normalizarCategoria,
  gerarSlug,
} from "@/lib/constantes";

const PRODUTO_VAZIO = {
  nome: "",
  descricao: "",
  preco: "",
  preco_antigo: "",
  imagem_url: "",
  link_afiliado: "",
  plataforma: "shopee",
  categoria: "outros",
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
  // Lista completa de categorias (fixas + criadas pelo usuário).
  const [categorias, setCategorias] = useState(CATEGORIAS);

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

  useEffect(() => {
    carregar();
    carregarCategorias();
  }, [carregar, carregarCategorias]);

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
  const produtosExibidos = produtos
    .filter((p) => !termoBusca || (p.nome || "").toLowerCase().includes(termoBusca))
    .sort(ordenarTabela);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
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
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metrica rotulo="Produtos" valor={produtos.length} />
        <Metrica rotulo="Em destaque" valor={totalDestaques} />
        <Metrica rotulo="Cliques em ofertas" valor={totalCliques} />
        <Metrica
          rotulo="Ganho potencial (1 de cada)"
          valor={formatarPreco(ganhoPotencial) || "R$ 0,00"}
        />
      </div>

      {/* abas */}
      <div className="mt-6 flex gap-1 border-b border-cc-line">
        <AbaBotao ativo={aba === "produtos"} onClick={() => setAba("produtos")}>
          📦 Produtos
        </AbaBotao>
        <AbaBotao ativo={aba === "desempenho"} onClick={() => setAba("desempenho")}>
          📊 Desempenho
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
          </div>

          {/* ações em lote */}
          {selecionados.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5">
              <p className="text-sm text-red-700">
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
                value={ordem}
                onChange={(e) => setOrdem(e.target.value)}
                className="rounded-xl border border-cc-line px-3 py-2.5 text-sm outline-none focus:border-cc-yellow"
              >
                <option value="recentes">Mais recentes</option>
                <option value="cliques">Mais clicados</option>
                <option value="ganho">Maior ganho/venda</option>
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
                      <th className="px-4 py-3 font-medium">Categoria</th>
                      <th className="px-4 py-3 font-medium">Preço</th>
                      <th className="px-4 py-3 font-medium">Ganho/venda</th>
                      <th className="px-4 py-3 font-medium">Cliques</th>
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
                            <div className="min-w-0">
                              <p className="truncate font-medium text-cc-ink">{p.nome}</p>
                              <p className="text-xs text-cc-muted">
                                {PLATAFORMAS.find((x) => x.id === p.plataforma)?.nome || p.plataforma}
                                {p.destaque ? " · ⭐ destaque" : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-cc-muted">{nomeCategoria(p.categoria, categorias)}</td>
                        <td className="px-4 py-3 text-cc-ink">{formatarPreco(p.preco) || "—"}</td>
                        <td className="px-4 py-3">
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
                        <td className="px-4 py-3 text-cc-muted">{p.cliques || 0}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => editar(p)}
                              className="rounded-lg border border-cc-line px-3 py-1.5 text-xs font-medium text-cc-ink hover:bg-cc-cream"
                            >
                              Editar
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
        />
      ) : null}

      {/* modal de adicionar vários */}
      {lote ? (
        <FormLote
          categorias={categorias}
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

function Metrica({ rotulo, valor }) {
  return (
    <div className="border border-cc-line bg-white px-4 py-4">
      <p className="cc-mono text-3xl text-cc-ink">{valor}</p>
      <p className="text-xs text-cc-muted">{rotulo}</p>
    </div>
  );
}

function AbaBotao({ ativo, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
        ativo
          ? "border-cc-yellow text-cc-ink"
          : "border-transparent text-cc-muted hover:text-cc-ink"
      }`}
    >
      {children}
    </button>
  );
}

function FormProduto({ form, setForm, salvar, fechar, salvando, erro, categorias = CATEGORIAS }) {
  const [enviando, setEnviando] = useState(false);
  const [erroUpload, setErroUpload] = useState("");
  const [buscandoML, setBuscandoML] = useState(false);
  const [erroML, setErroML] = useState("");
  const [novaImg, setNovaImg] = useState(""); // URL de foto extra (galeria)

  async function buscarDoMercadoLivre() {
    const link = (form.link_afiliado || "").trim();
    if (!link) {
      setErroML("Cole o link de afiliado antes de buscar.");
      return;
    }
    setErroML("");
    setBuscandoML(true);
    try {
      const res = await fetch("/api/produtos/buscar-ml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErroML(data.erro || "Não consegui buscar os dados desse link.");
        return;
      }
      setForm((f) => ({
        ...f,
        nome: data.nome || f.nome,
        preco: data.preco ?? f.preco,
        imagem_url: data.imagem_url || f.imagem_url,
      }));
    } catch {
      setErroML("Erro de conexão.");
    } finally {
      setBuscandoML(false);
    }
  }

  const set = (campo) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [campo]: v }));
  };

  // Reduz a imagem no próprio navegador e envia; devolve a URL hospedada.
  // Reutilizada pela foto principal e pela galeria. Lança erro em caso de falha.
  async function uploadImagem(file) {
    if (!file.type || !file.type.startsWith("image/")) {
      throw new Error("tipo");
    }
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("leitura"));
      reader.readAsDataURL(file);
    });

    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("formato"));
      i.src = dataUrl;
    });

    const MAX = 1200; // maior lado da imagem em pixels
    let { width, height } = img;
    if (width > MAX || height > MAX) {
      if (width >= height) {
        height = Math.round((height * MAX) / width);
        width = MAX;
      } else {
        width = Math.round((width * MAX) / height);
        height = MAX;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(img, 0, 0, width, height);

    const ehPng = file.type === "image/png";
    const tipoSaida = ehPng ? "image/png" : "image/jpeg";
    const ext = ehPng ? "png" : "jpg";
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, tipoSaida, 0.85));
    if (!blob) throw new Error("conversao");

    const fd = new FormData();
    fd.append("file", blob, `produto.${ext}`);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (!res.ok) throw new Error(data.erro || `Falha ao enviar a imagem (erro ${res.status}).`);
    return data.url;
  }

  async function enviarImagem(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErroUpload("");
    setEnviando(true);
    try {
      const url = await uploadImagem(file);
      setForm((f) => ({ ...f, imagem_url: url }));
    } catch (err) {
      setErroUpload(
        err.message === "tipo"
          ? "Selecione um arquivo de imagem (JPG, PNG, WEBP...)."
          : "Não consegui processar essa imagem. Tente outra (JPG ou PNG)."
      );
    } finally {
      setEnviando(false);
      e.target.value = "";
    }
  }

  async function enviarImagensGaleria(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setErroUpload("");
    setEnviando(true);
    try {
      const urls = [];
      for (const file of files) {
        urls.push(await uploadImagem(file));
      }
      setForm((f) => ({ ...f, imagens: [...(f.imagens || []), ...urls] }));
    } catch (err) {
      setErroUpload("Não consegui processar uma das fotos. Tente outra (JPG ou PNG).");
    } finally {
      setEnviando(false);
      e.target.value = "";
    }
  }

  function adicionarImagemUrl() {
    const url = novaImg.trim();
    if (!url) return;
    setForm((f) => ({ ...f, imagens: [...(f.imagens || []), url] }));
    setNovaImg("");
  }

  function removerImagemGaleria(url) {
    setForm((f) => ({ ...f, imagens: (f.imagens || []).filter((u) => u !== url) }));
  }

  const campo =
    "w-full rounded-xl border border-cc-line px-3 py-2.5 text-sm outline-none focus:border-cc-yellow focus:ring-2 focus:ring-cc-yellow/30";
  const rotulo = "mb-1 block text-sm font-medium text-cc-ink";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-lg rounded-3xl border border-cc-line bg-white p-6 shadow-card">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="cc-mono text-2xl text-cc-ink">
            {form.id ? "Editar produto" : "Novo produto"}
          </h2>
          <button onClick={fechar} className="text-cc-muted hover:text-cc-ink" aria-label="Fechar">
            ✕
          </button>
        </div>

        <form onSubmit={salvar} className="space-y-4">
          <div>
            <label className={rotulo}>Nome do produto *</label>
            <input value={form.nome} onChange={set("nome")} className={campo} required />
          </div>

          <div>
            <label className={rotulo}>Link de afiliado *</label>
            <input
              value={form.link_afiliado}
              onChange={(e) => {
                const v = e.target.value;
                const p = detectarPlataforma(v);
                setForm((f) => ({ ...f, link_afiliado: v, plataforma: p || f.plataforma }));
              }}
              className={campo}
              placeholder="https://shopee.com.br/..."
              required
            />
            <p className="mt-1 text-xs text-cc-muted">
              A plataforma é detectada automaticamente pelo link (dá pra ajustar abaixo).
            </p>
            {form.plataforma === "mercado_livre" ? (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={buscarDoMercadoLivre}
                  disabled={buscandoML}
                  className="rounded-full border border-cc-line px-4 py-1.5 text-xs font-medium text-cc-ink transition hover:bg-cc-cream disabled:opacity-60"
                >
                  {buscandoML ? "Buscando..." : "🔎 Buscar nome, preço e imagem"}
                </button>
                {erroML ? (
                  <p className="mt-1 text-xs text-red-600">{erroML}</p>
                ) : (
                  <p className="mt-1 text-xs text-cc-muted">
                    Preenche nome, preço e imagem automaticamente a partir do link.
                  </p>
                )}
              </div>
            ) : null}
          </div>

          <div>
            <label className={rotulo}>Imagem do produto</label>
            {form.imagem_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.imagem_url}
                alt="Pré-visualização"
                className="mb-2 h-28 w-28 rounded-xl border border-cc-line object-cover"
              />
            ) : null}
            <input
              type="file"
              accept="image/*"
              onChange={enviarImagem}
              className="block w-full text-sm text-cc-muted file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-cc-yellow file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cc-ink hover:file:bg-cc-yellow-dark"
            />
            {enviando ? (
              <p className="mt-1 text-xs text-cc-muted">Enviando imagem...</p>
            ) : null}
            {erroUpload ? (
              <p className="mt-1 text-xs text-red-600">{erroUpload}</p>
            ) : null}
            <input
              value={form.imagem_url}
              onChange={set("imagem_url")}
              className={`${campo} mt-2`}
              placeholder="ou cole uma URL de imagem aqui"
            />
          </div>

          {/* galeria — fotos extras */}
          <div>
            <label className={rotulo}>Mais fotos (galeria)</label>
            {form.imagens && form.imagens.length > 0 ? (
              <div className="mb-2 flex flex-wrap gap-2">
                {form.imagens.map((url) => (
                  <div key={url} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="h-20 w-20 rounded-xl border border-cc-line object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removerImagemGaleria(url)}
                      aria-label="Remover foto"
                      className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-cc-ink text-xs text-white shadow"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={enviarImagensGaleria}
              className="block w-full text-sm text-cc-muted file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-cc-cream file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cc-ink hover:file:bg-cc-line"
            />
            <div className="mt-2 flex gap-2">
              <input
                value={novaImg}
                onChange={(e) => setNovaImg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    adicionarImagemUrl();
                  }
                }}
                className={campo}
                placeholder="ou cole a URL de uma foto extra"
              />
              <button
                type="button"
                onClick={adicionarImagemUrl}
                className="shrink-0 rounded-xl border border-cc-line px-4 text-sm font-medium text-cc-ink transition hover:bg-cc-cream"
              >
                Adicionar
              </button>
            </div>
            <p className="mt-1 text-xs text-cc-muted">
              Pode selecionar várias de uma vez. A primeira foto (imagem principal) é a que aparece
              nos cards; as extras formam a galeria na página do produto.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={rotulo}>Preço (R$)</label>
              <input type="number" step="0.01" value={form.preco} onChange={set("preco")} className={campo} placeholder="89.90" />
            </div>
            <div>
              <label className={rotulo}>Preço antigo (R$)</label>
              <input type="number" step="0.01" value={form.preco_antigo} onChange={set("preco_antigo")} className={campo} placeholder="149.90" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={rotulo}>Comissão do afiliado (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={form.comissao_percent}
                onChange={set("comissao_percent")}
                className={campo}
                placeholder="10"
              />
            </div>
            <div>
              <label className={rotulo}>Você ganha por venda</label>
              <div className="rounded-xl border border-cc-line bg-cc-cream/50 px-3 py-2.5 text-sm font-semibold text-br-green">
                {form.preco && form.comissao_percent
                  ? formatarPreco((Number(form.preco) * Number(form.comissao_percent)) / 100)
                  : "—"}
              </div>
            </div>
          </div>
          <p className="-mt-1 text-xs text-cc-muted">
            Quanto você recebe por cada venda (uso interno — não aparece no site).
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={rotulo}>Plataforma</label>
              <select value={form.plataforma} onChange={set("plataforma")} className={campo}>
                {PLATAFORMAS.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={rotulo}>Categoria</label>
              <select value={form.categoria} onChange={set("categoria")} className={campo}>
                {categorias.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={rotulo}>Nota (0 a 5)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.nota}
                onChange={set("nota")}
                className={campo}
                placeholder="4.8"
              />
            </div>
            <div>
              <label className={rotulo}>Nº de avaliações</label>
              <input
                type="number"
                step="1"
                min="0"
                value={form.avaliacoes}
                onChange={set("avaliacoes")}
                className={campo}
                placeholder="1240"
              />
            </div>
          </div>
          <p className="-mt-1 text-xs text-cc-muted">
            Opcional — copie a nota e o nº de avaliações da loja (Shopee/ML) para dar
            confiança ao cliente. Deixe em branco para não mostrar estrelas.
          </p>

          <div>
            <label className={rotulo}>Descrição</label>
            <textarea value={form.descricao} onChange={set("descricao")} className={campo} rows={3} />
          </div>

          <label className="flex items-center gap-2 text-sm text-cc-ink">
            <input type="checkbox" checked={!!form.destaque} onChange={set("destaque")} className="h-4 w-4 accent-cc-yellow" />
            Mostrar na seção “Em destaque” da home
          </label>

          {erro ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
          ) : null}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 rounded-full bg-cc-yellow px-4 py-2.5 text-sm font-bold text-cc-ink transition hover:bg-cc-yellow-dark disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Salvar produto"}
            </button>
            <button
              type="button"
              onClick={fechar}
              className="rounded-full border border-cc-line px-5 py-2.5 text-sm font-medium text-cc-muted hover:text-cc-ink"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormLote({ fechar, aoConcluir, categorias = CATEGORIAS }) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState(null);

  // Campos por linha, em ordem (só Nome e Link são obrigatórios):
  // Nome | Link | Preço | Preço antigo | Categoria | Plataforma | Nota | Avaliações | Imagem
  function parseLinhas(txt) {
    return txt
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((linha) => {
        const partes = linha.split("|").map((p) => p.trim());
        const [
          nome,
          link,
          preco,
          precoAntigo,
          categoria,
          plataforma,
          nota,
          avaliacoes,
          imagem,
          comissao,
        ] = partes;
        // O campo de imagem aceita VÁRIAS URLs separadas por vírgula:
        // a primeira vira a foto principal e o resto vai pra galeria.
        const fotos = (imagem || "")
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean);
        return {
          nome: nome || "",
          link_afiliado: link || "",
          preco: preco || "",
          preco_antigo: precoAntigo || "",
          categoria: normalizarCategoria(categoria || "", categorias),
          plataforma: normalizarPlataforma(plataforma) || detectarPlataforma(link) || "shopee",
          nota: nota || "",
          avaliacoes: avaliacoes || "",
          imagem_url: fotos[0] || "",
          imagens: fotos.slice(1),
          comissao_percent: comissao || "",
        };
      });
  }

  const previa = parseLinhas(texto);
  const validos = previa.filter((p) => p.nome && /^https:\/\//i.test(p.link_afiliado || ""));
  const invalidos = previa.length - validos.length;

  const nomePlat = (id) => PLATAFORMAS.find((p) => p.id === id)?.nome || id;

  async function importar(e) {
    e.preventDefault();
    setErro("");
    if (validos.length === 0) {
      setErro("Nenhuma linha válida. Cada linha precisa de nome e link começando com https://");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/produtos/lote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produtos: validos }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || "Erro ao importar.");
      } else {
        setResultado(data);
        setTimeout(aoConcluir, 1300);
      }
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-3xl border border-cc-line bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="cc-mono text-2xl text-cc-ink">Adicionar vários produtos</h2>
          <button onClick={fechar} className="text-cc-muted hover:text-cc-ink" aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="mb-4 border border-cc-line bg-cc-cream/60 p-3 text-xs text-cc-ink">
          <p className="font-semibold">Um produto por linha, separando os campos por “|”:</p>
          <p className="mt-1 font-mono text-[11px] leading-relaxed">
            Nome | Link | Preço | Preço antigo | Categoria | Plataforma | Nota | Avaliações | Imagem
            | Comissão %
          </p>
          <p className="mt-2 text-cc-muted">
            Só <b>Nome</b> e <b>Link</b> são obrigatórios. O resto é opcional — deixe vazio entre
            as barras para pular (ex.: <span className="font-mono">Nome | Link | | | casa</span>). A
            <b> plataforma</b> é detectada pelo link se ficar vazia. A <b>categoria</b> pode ser o
            nome ou o atalho dela (use a aba “Categorias” para criar novas antes). No campo{" "}
            <b>Imagem</b>, dá pra colar várias URLs separadas por vírgula (a 1ª é a principal, o
            resto vira galeria).
          </p>
          <p className="mt-2 text-cc-muted">Exemplo com todos os campos preenchidos:</p>
          <p className="mt-1 break-all font-mono text-[11px] text-cc-muted">
            Fone TWS | https://shopee.com.br/abc | 89.90 | 149.90 | eletronicos | shopee | 4.8 | 1240 | https://img.jpg | 12
          </p>
        </div>

        {resultado ? (
          <div className="border border-br-green bg-[#F0FAF3] p-4 text-sm text-br-green">
            ✅ {resultado.adicionados} produto(s) adicionado(s)
            {resultado.ignorados ? ` · ${resultado.ignorados} ignorado(s)` : ""}.
          </div>
        ) : (
          <form onSubmit={importar} className="space-y-3">
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={7}
              placeholder="Cole aqui suas linhas, uma por produto..."
              className="w-full border border-cc-line p-3 font-mono text-xs outline-none focus:border-cc-yellow focus:ring-2 focus:ring-cc-yellow/30"
            />
            <p className="text-xs text-cc-muted">
              {validos.length} produto(s) válido(s) detectado(s)
              {invalidos > 0 ? ` · ${invalidos} linha(s) sem nome ou link válido` : ""}
            </p>

            {/* Prévia: mostra como cada produto foi interpretado (evita erros) */}
            {validos.length > 0 ? (
              <div className="max-h-56 overflow-auto rounded-lg border border-cc-line">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-cc-cream/80 text-[11px] uppercase tracking-wide text-cc-muted">
                    <tr>
                      <th className="px-2 py-1.5 font-medium">Nome</th>
                      <th className="px-2 py-1.5 font-medium">Preço</th>
                      <th className="px-2 py-1.5 font-medium">Categoria</th>
                      <th className="px-2 py-1.5 font-medium">Plataforma</th>
                      <th className="px-2 py-1.5 font-medium">Nota</th>
                      <th className="px-2 py-1.5 font-medium">Ganho/venda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validos.map((p, i) => (
                      <tr key={i} className="border-t border-cc-line">
                        <td className="max-w-[180px] truncate px-2 py-1.5 text-cc-ink">{p.nome}</td>
                        <td className="px-2 py-1.5 text-cc-ink">
                          {p.preco ? `R$ ${p.preco}` : "—"}
                          {p.preco_antigo ? (
                            <span className="text-cc-muted line-through"> {p.preco_antigo}</span>
                          ) : null}
                        </td>
                        <td className="px-2 py-1.5 text-cc-muted">
                          {nomeCategoria(p.categoria, categorias)}
                        </td>
                        <td className="px-2 py-1.5 text-cc-muted">{nomePlat(p.plataforma)}</td>
                        <td className="px-2 py-1.5 text-cc-muted">
                          {p.nota ? `${p.nota}${p.avaliacoes ? ` (${p.avaliacoes})` : ""}` : "—"}
                        </td>
                        <td className="px-2 py-1.5 text-br-green">
                          {p.preco && p.comissao_percent
                            ? `${formatarPreco(
                                (Number(p.preco) * Number(p.comissao_percent)) / 100
                              )} (${p.comissao_percent}%)`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {erro ? <p className="bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={enviando || validos.length === 0}
                className="flex-1 bg-cc-yellow px-4 py-2.5 text-sm font-bold text-cc-ink transition hover:bg-cc-yellow-dark disabled:opacity-60"
              >
                {enviando ? "Importando..." : `Importar ${validos.length} produto(s)`}
              </button>
              <button
                type="button"
                onClick={fechar}
                className="border border-cc-line px-5 py-2.5 text-sm font-medium text-cc-muted hover:text-cc-ink"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function SecaoDesempenho() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/desempenho");
        setDados(await res.json());
      } catch {
        setDados(null);
      }
      setCarregando(false);
    })();
  }, []);

  if (carregando) return <p className="mt-4 text-sm text-cc-muted">Carregando...</p>;
  if (!dados) return <p className="mt-4 text-sm text-cc-muted">Não foi possível carregar os dados.</p>;

  const { porDia = [], top = [], totalSemana = 0, totalHoje = 0, semTabela } = dados;
  const maxDia = Math.max(1, ...porDia.map((d) => d.total));
  const maxTop = Math.max(1, ...top.map((t) => t.total));
  const diasSemana = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  const labelDia = (iso) => diasSemana[new Date(iso + "T12:00:00").getDay()];

  return (
    <div className="mt-4 space-y-4">
      {semTabela ? (
        <div className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Para começar a registrar os cliques por data, rode a migração{" "}
          <b>melhorias-onda9.sql</b> no Supabase (SQL Editor).
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <Metrica rotulo="Cliques hoje" valor={totalHoje} />
        <Metrica rotulo="Cliques (7 dias)" valor={totalSemana} />
        <Metrica rotulo="Média por dia" valor={Math.round(totalSemana / 7)} />
      </div>

      {/* gráfico dos últimos 7 dias */}
      <div className="border border-cc-line bg-white p-5">
        <h3 className="text-sm font-bold text-cc-ink">Cliques nos últimos 7 dias</h3>
        <div className="mt-4 flex items-end gap-2">
          {porDia.map((d) => (
            <div key={d.dia} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-semibold text-cc-ink">{d.total}</span>
              <div className="flex h-28 w-full items-end">
                <div
                  className="w-full rounded-t bg-cc-yellow"
                  style={{
                    height: `${(d.total / maxDia) * 100}%`,
                    minHeight: d.total > 0 ? 4 : 0,
                  }}
                />
              </div>
              <span className="text-[11px] text-cc-muted">{labelDia(d.dia)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* top produtos da semana */}
      <div className="border border-cc-line bg-white p-5">
        <h3 className="text-sm font-bold text-cc-ink">Mais clicados na semana</h3>
        {top.length === 0 ? (
          <p className="mt-3 text-sm text-cc-muted">
            Ainda sem cliques registrados nos últimos 7 dias.
          </p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {top.map((t, i) => (
              <div key={t.produto_id} className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-right text-xs font-semibold text-cc-muted">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm text-cc-ink">{t.nome}</span>
                    <span className="shrink-0 text-sm font-semibold text-cc-ink">{t.total}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-cc-cream">
                    <div
                      className="h-1.5 rounded-full bg-br-green"
                      style={{ width: `${(t.total / maxTop) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-cc-muted">
        O registro por data começou agora — os números crescem conforme as pessoas clicam em “Ver
        Oferta”. (O total acumulado de sempre fica na aba Produtos.)
      </p>
    </div>
  );
}

function SecaoCategorias({ categorias = CATEGORIAS, aoMudar }) {
  const [custom, setCustom] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [nome, setNome] = useState("");
  const [emoji, setEmoji] = useState("");
  const [msg, setMsg] = useState("");

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
    </div>
  );
}

function SecaoProximoJogo() {
  const [jogo, setJogo] = useState({ adversario: "", data: "", local: "", mando: "casa" });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/config?chave=proximo_jogo");
        const data = await res.json();
        if (data?.valor) {
          setJogo({ adversario: "", data: "", local: "", mando: "casa", ...data.valor });
        }
      } catch {
        /* ignora */
      }
      setCarregando(false);
    })();
  }, []);

  const set = (campo) => (e) => setJogo((j) => ({ ...j, [campo]: e.target.value }));

  async function salvar() {
    setMsg("");
    setSalvando(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chave: "proximo_jogo", valor: jogo }),
      });
      const data = await res.json();
      setMsg(res.ok ? "✅ Próximo jogo salvo!" : data.erro || "Erro ao salvar.");
    } catch {
      setMsg("Erro de conexão.");
    } finally {
      setSalvando(false);
    }
  }

  async function remover() {
    setMsg("");
    setSalvando(true);
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chave: "proximo_jogo", valor: null }),
      });
      setJogo({ adversario: "", data: "", local: "", mando: "casa" });
      setMsg("Jogo removido (não aparece mais no site).");
    } catch {
      setMsg("Erro de conexão.");
    } finally {
      setSalvando(false);
    }
  }

  const campo = "w-full border border-cc-line px-3 py-2 text-sm outline-none focus:border-cc-yellow";
  const rotulo = "mb-1 block text-sm font-medium text-cc-ink";

  return (
    <div className="mt-4 border border-cc-line bg-white p-5">
      <h2 className="cc-mono text-xl text-cc-ink">⚽ Próximo jogo do Brasil</h2>
      <p className="mt-1 text-xs text-cc-muted">
        Aparece num banner na home, com contagem regressiva. Deixe sem adversário/data
        para não mostrar nada.
      </p>
      {carregando ? (
        <p className="mt-4 text-sm text-cc-muted">Carregando...</p>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={rotulo}>Adversário</label>
              <input value={jogo.adversario} onChange={set("adversario")} className={campo} placeholder="Argentina" />
            </div>
            <div>
              <label className={rotulo}>Mando de campo</label>
              <select value={jogo.mando} onChange={set("mando")} className={campo}>
                <option value="casa">Brasil em casa (Brasil x Adversário)</option>
                <option value="fora">Brasil fora (Adversário x Brasil)</option>
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={rotulo}>Data e hora</label>
              <input type="datetime-local" value={jogo.data} onChange={set("data")} className={campo} />
            </div>
            <div>
              <label className={rotulo}>Local / competição (opcional)</label>
              <input value={jogo.local} onChange={set("local")} className={campo} placeholder="Maracanã · Eliminatórias" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={salvar}
              disabled={salvando}
              className="bg-cc-yellow px-5 py-2.5 text-sm font-bold text-cc-ink transition hover:bg-cc-yellow-dark active:translate-y-px disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Salvar jogo"}
            </button>
            <button
              onClick={remover}
              disabled={salvando}
              className="border border-cc-line px-4 py-2.5 text-sm font-medium text-cc-muted hover:text-cc-ink"
            >
              Remover
            </button>
            {msg ? <span className="text-sm text-cc-ink">{msg}</span> : null}
          </div>
        </div>
      )}
    </div>
  );
}

function SecaoCupons() {
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

function FormLoteCupons({ listaAtual = [], fechar, aoConcluir }) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState(null);

  function detectaPlat(txt) {
    const l = (txt || "").toLowerCase().trim();
    if (l.includes("tiktok") || l.includes("tik")) return "tiktok_shop";
    if (l.includes("mercado") || l === "ml" || l.includes("livre") || l.includes("meli"))
      return "mercado_livre";
    return "shopee";
  }

  function parseLinhas(txt) {
    return txt
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((linha) => {
        const [plat, codigo, descricao, validade, minimo] = linha
          .split("|")
          .map((p) => (p || "").trim());
        return {
          plataforma: detectaPlat(plat),
          codigo: (codigo || "").toUpperCase(),
          descricao: descricao || "",
          validade: validade || "",
          minimo: minimo || "",
        };
      });
  }

  const previa = parseLinhas(texto);
  const validos = previa.filter((c) => c.codigo);

  async function importar(e) {
    e.preventDefault();
    setErro("");
    if (validos.length === 0) {
      setErro("Nenhuma linha válida. Cada linha precisa de pelo menos plataforma e código.");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chave: "cupons", valor: [...listaAtual, ...validos] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || "Erro ao importar.");
      } else {
        setResultado({ adicionados: validos.length });
        setTimeout(aoConcluir, 1300);
      }
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-2xl border border-cc-line bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="cc-mono text-2xl text-cc-ink">Adicionar vários cupons</h2>
          <button onClick={fechar} className="text-cc-muted hover:text-cc-ink" aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="mb-4 border border-cc-line bg-cc-cream/60 p-3 text-xs text-cc-ink">
          <p className="font-semibold">Um cupom por linha, neste formato:</p>
          <p className="mt-1 font-mono">plataforma | código | descrição | validade | mínimo</p>
          <p className="mt-2 text-cc-muted">
            Só <b>plataforma</b> e <b>código</b> são obrigatórios. O <b>mínimo</b> (valor de
            compra) faz o cupom só aparecer em produtos que alcançam esse valor. Exemplo:
          </p>
          <p className="mt-1 font-mono text-cc-muted">shopee | CUPOM10 | 10% OFF | 30/06 | 40</p>
        </div>

        {resultado ? (
          <div className="border border-br-green bg-[#F0FAF3] p-4 text-sm text-br-green">
            ✅ {resultado.adicionados} cupom(ns) adicionado(s).
          </div>
        ) : (
          <form onSubmit={importar} className="space-y-3">
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={9}
              placeholder={"shopee | FRETE10 | Frete grátis\nmercado livre | ML20 | R$20 OFF | 30/06 | 100\ntiktok | TT15"}
              className="w-full border border-cc-line p-3 font-mono text-xs outline-none focus:border-cc-yellow focus:ring-2 focus:ring-cc-yellow/30"
            />
            <p className="text-xs text-cc-muted">
              {validos.length} cupom(ns) válido(s) detectado(s)
              {previa.length - validos.length > 0
                ? ` · ${previa.length - validos.length} linha(s) sem código`
                : ""}
            </p>

            {erro ? <p className="bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={enviando || validos.length === 0}
                className="flex-1 bg-cc-yellow px-4 py-2.5 text-sm font-bold text-cc-ink transition hover:bg-cc-yellow-dark disabled:opacity-60"
              >
                {enviando ? "Importando..." : `Importar ${validos.length} cupom(ns)`}
              </button>
              <button
                type="button"
                onClick={fechar}
                className="border border-cc-line px-5 py-2.5 text-sm font-medium text-cc-muted hover:text-cc-ink"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
