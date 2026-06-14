"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CATEGORIAS, PLATAFORMAS, formatarPreco, nomeCategoria, detectarPlataforma } from "@/lib/constantes";

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

  const carregar = useCallback(async () => {
    setCarregando(true);
    const { data } = await supabase
      .from("produtos")
      .select("*")
      .order("criado_em", { ascending: false });
    setProdutos(data || []);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

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
    setSelecionados((sel) =>
      sel.length === produtos.length ? [] : produtos.map((p) => p.id)
    );
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

  async function sair() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const totalCliques = produtos.reduce((s, p) => s + (p.cliques || 0), 0);
  const totalDestaques = produtos.filter((p) => p.destaque).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* topo */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="cc-mono text-3xl text-cc-ink">Painel</h1>
          <p className="text-sm text-cc-muted">Gerencie os produtos da loja</p>
        </div>
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
            onClick={sair}
            className="border border-cc-line px-4 py-2.5 text-sm font-medium text-cc-muted transition hover:text-cc-ink"
          >
            Sair
          </button>
        </div>
      </div>

      {/* métricas */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Metrica rotulo="Produtos" valor={produtos.length} />
        <Metrica rotulo="Em destaque" valor={totalDestaques} />
        <Metrica rotulo="Cliques em ofertas" valor={totalCliques} />
      </div>

      {/* próximo jogo do Brasil */}
      <SecaoProximoJogo />

      {/* cupons por plataforma */}
      <SecaoCupons />

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

      {/* tabela */}
      <div className="mt-6 overflow-hidden border border-cc-line bg-white">
        {carregando ? (
          <p className="px-4 py-10 text-center text-sm text-cc-muted">Carregando...</p>
        ) : produtos.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-cc-muted">
            Nenhum produto ainda. Clique em “Novo produto” para começar.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-cc-line bg-cc-cream/60 text-xs uppercase tracking-wide text-cc-muted">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={produtos.length > 0 && selecionados.length === produtos.length}
                      onChange={toggleTodos}
                      className="h-4 w-4 accent-cc-yellow"
                      aria-label="Selecionar todos"
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Preço</th>
                  <th className="px-4 py-3 font-medium">Cliques</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => (
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
                    <td className="px-4 py-3 text-cc-muted">{nomeCategoria(p.categoria)}</td>
                    <td className="px-4 py-3 text-cc-ink">{formatarPreco(p.preco) || "—"}</td>
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

      {/* formulário (modal) */}
      {form ? (
        <FormProduto
          form={form}
          setForm={setForm}
          salvar={salvar}
          fechar={() => setForm(null)}
          salvando={salvando}
          erro={erro}
        />
      ) : null}

      {/* modal de adicionar vários */}
      {lote ? (
        <FormLote
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

function FormProduto({ form, setForm, salvar, fechar, salvando, erro }) {
  const [enviando, setEnviando] = useState(false);
  const [erroUpload, setErroUpload] = useState("");
  const [buscandoML, setBuscandoML] = useState(false);
  const [erroML, setErroML] = useState("");

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

  async function enviarImagem(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErroUpload("");

    if (!file.type || !file.type.startsWith("image/")) {
      setErroUpload("Selecione um arquivo de imagem (JPG, PNG, WEBP...).");
      return;
    }

    setEnviando(true);
    try {
      // Reduz a imagem no próprio navegador antes de enviar. Isso evita o
      // limite de tamanho do servidor e deixa o site mais rápido. Funciona
      // com qualquer formato que o navegador saiba abrir (jpg, jpeg, png, webp...).
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
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, tipoSaida, 0.85)
      );
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

      if (!res.ok) {
        setErroUpload(data.erro || `Falha ao enviar a imagem (erro ${res.status}).`);
      } else {
        setForm((f) => ({ ...f, imagem_url: data.url }));
      }
    } catch (err) {
      setErroUpload("Não consegui processar essa imagem. Tente outra (JPG ou PNG).");
    } finally {
      setEnviando(false);
    }
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
                {CATEGORIAS.map((c) => (
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

function FormLote({ fechar, aoConcluir }) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState(null);

  function parseLinhas(txt) {
    return txt
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((linha) => {
        const [nome, preco, link, categoria, plataforma] = linha
          .split("|")
          .map((p) => p.trim());
        return {
          nome: nome || "",
          preco: preco || "",
          link_afiliado: link || "",
          categoria: categoria || "outros",
          plataforma: plataforma || detectarPlataforma(link) || "shopee",
        };
      });
  }

  const previa = parseLinhas(texto);
  const validos = previa.filter(
    (p) => p.nome && /^https:\/\//i.test(p.link_afiliado || "")
  );

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
      <div className="my-8 w-full max-w-2xl border border-cc-line bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="cc-mono text-2xl text-cc-ink">Adicionar vários produtos</h2>
          <button onClick={fechar} className="text-cc-muted hover:text-cc-ink" aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="mb-4 border border-cc-line bg-cc-cream/60 p-3 text-xs text-cc-ink">
          <p className="font-semibold">Um produto por linha, neste formato:</p>
          <p className="mt-1 font-mono">Nome | preço | link | categoria | plataforma</p>
          <p className="mt-2 text-cc-muted">
            Só <b>nome</b> e <b>link</b> são obrigatórios. Preço, categoria e plataforma são
            opcionais (a plataforma é detectada pelo link). Exemplo:
          </p>
          <p className="mt-1 font-mono text-cc-muted">
            Fone TWS | 89.90 | https://shopee.com.br/abc | eletronicos
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
              rows={9}
              placeholder="Cole aqui suas linhas, uma por produto..."
              className="w-full border border-cc-line p-3 font-mono text-xs outline-none focus:border-cc-yellow focus:ring-2 focus:ring-cc-yellow/30"
            />
            <p className="text-xs text-cc-muted">
              {validos.length} produto(s) válido(s) detectado(s)
              {previa.length - validos.length > 0
                ? ` · ${previa.length - validos.length} linha(s) sem nome ou link válido`
                : ""}
            </p>

            {erro ? (
              <p className="bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
            ) : null}

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
    <div className="mt-6 border border-cc-line bg-white p-5">
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
    <div className="mt-6 border border-cc-line bg-white p-5">
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
