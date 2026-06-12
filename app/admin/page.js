"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CATEGORIAS, PLATAFORMAS, formatarPreco, nomeCategoria } from "@/lib/constantes";

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
};

export default function AdminPage() {
  const router = useRouter();
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState(null); // null = fechado; objeto = abrindo
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

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
        <div className="flex gap-2">
          <button
            onClick={novo}
            className="rounded-full bg-cc-yellow px-5 py-2.5 text-sm font-bold text-cc-ink transition hover:bg-cc-yellow-dark"
          >
            + Novo produto
          </button>
          <button
            onClick={sair}
            className="rounded-full border border-cc-line px-4 py-2.5 text-sm font-medium text-cc-muted transition hover:text-cc-ink"
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

      {/* tabela */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-cc-line bg-white">
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
    </div>
  );
}

function Metrica({ rotulo, valor }) {
  return (
    <div className="rounded-2xl border border-cc-line bg-white px-4 py-4">
      <p className="cc-mono text-3xl text-cc-ink">{valor}</p>
      <p className="text-xs text-cc-muted">{rotulo}</p>
    </div>
  );
}

function FormProduto({ form, setForm, salvar, fechar, salvando, erro }) {
  const set = (campo) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [campo]: v }));
  };

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
              onChange={set("link_afiliado")}
              className={campo}
              placeholder="https://shopee.com.br/..."
              required
            />
          </div>

          <div>
            <label className={rotulo}>URL da imagem</label>
            <input
              value={form.imagem_url}
              onChange={set("imagem_url")}
              className={campo}
              placeholder="https://..."
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
