"use client";

import { useState } from "react";
import {
  CATEGORIAS,
  PLATAFORMAS,
  formatarPreco,
  detectarPlataforma,
} from "@/lib/constantes";
import { subcategoriasDe } from "@/lib/subcategorias";

export default function FormProduto({
  form,
  setForm,
  salvar,
  fechar,
  salvando,
  erro,
  categorias = CATEGORIAS,
  subcategorias = {},
}) {
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

  // Liga/desliga uma subcategoria na lista do produto (várias por produto).
  function toggleSub(slug) {
    setForm((f) => {
      const atuais = Array.isArray(f.subcategorias) ? f.subcategorias : [];
      return {
        ...f,
        subcategorias: atuais.includes(slug)
          ? atuais.filter((s) => s !== slug)
          : [...atuais, slug],
      };
    });
  }

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

  // Subcategorias disponíveis para a categoria escolhida (pode ser vazio).
  const subDaCategoria = subcategoriasDe(subcategorias, form.categoria);

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
              <select
                value={form.categoria}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categoria: e.target.value, subcategorias: [] }))
                }
                className={campo}
              >
                {categorias.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subcategorias — só aparecem se a categoria escolhida tiver alguma.
              Crie/edite as subcategorias na aba “Categorias” do painel. Pode
              marcar quantas quiser no mesmo produto. */}
          {subDaCategoria.length > 0 ? (
            <div>
              <label className={rotulo}>Subcategorias</label>
              <div className="flex flex-wrap gap-2">
                {subDaCategoria.map((s) => {
                  const ativa = (form.subcategorias || []).includes(s.slug);
                  return (
                    <button
                      type="button"
                      key={s.slug}
                      onClick={() => toggleSub(s.slug)}
                      aria-pressed={ativa}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                        ativa
                          ? "border-cc-yellow-dark bg-cc-yellow text-cc-ink"
                          : "border-cc-line bg-white text-cc-ink hover:bg-cc-cream"
                      }`}
                    >
                      {ativa ? "✓ " : ""}
                      {s.nome}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-cc-muted">
                Clique pra marcar/desmarcar — pode escolher quantas quiser.
              </p>
            </div>
          ) : null}

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

          <label className="flex items-start gap-2 text-sm text-cc-ink">
            <input
              type="checkbox"
              checked={!!form.destaque}
              onChange={set("destaque")}
              className="mt-0.5 h-4 w-4 accent-cc-yellow"
            />
            <span>
              Destacar em <b>“Ofertas da Semana”</b> da home
              <span className="block text-xs text-cc-muted">
                Você escolhe a dedo quais produtos aparecem ali (não depende de cliques).
              </span>
            </span>
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

