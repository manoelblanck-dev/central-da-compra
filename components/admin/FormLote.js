"use client";

import { useState } from "react";
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
import { reduzirEEnviarImagem } from "@/lib/imagem";
import Galeria from "@/components/Galeria";
import PlatformBadge from "@/components/PlatformBadge";

// Campo de "adicionar foto por URL" (estado próprio, pra não poluir o pai).
function AdicionarUrl({ aoAdicionar }) {
  const [url, setUrl] = useState("");
  function add() {
    const u = url.trim();
    if (!u) return;
    aoAdicionar(u);
    setUrl("");
  }
  return (
    <div className="mt-2 flex gap-2">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        placeholder="ou cole a URL de uma foto"
        className="min-w-0 flex-1 rounded-lg border border-cc-line px-2.5 py-1.5 text-xs outline-none focus:border-cc-yellow"
      />
      <button
        type="button"
        onClick={add}
        className="shrink-0 rounded-lg border border-cc-line px-3 text-xs font-medium text-cc-ink transition hover:bg-cc-cream"
      >
        Adicionar
      </button>
    </div>
  );
}

export default function FormLote({ fechar, aoConcluir, categorias = CATEGORIAS, modoDrop = false }) {
  const [etapa, setEtapa] = useState("texto"); // texto | fotos | revisar
  const [texto, setTexto] = useState("");
  const [itens, setItens] = useState([]); // produtos editáveis (depois do parse)
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState(null);
  const [previewIdx, setPreviewIdx] = useState(null); // produto em preview
  const [uploadIdx, setUploadIdx] = useState(null); // produto enviando foto
  const [erroUpload, setErroUpload] = useState("");

  // Campos por linha, em ordem (só Nome e Link são obrigatórios):
  // Nome | Link | Preço | Preço antigo | Categoria | Plataforma | Nota | Avaliações | Imagem | Comissão | Subcategoria
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
          subcategoria,
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
          subcategorias: (subcategoria || "")
            .split(",")
            .map((s) => gerarSlug(s.trim()))
            .filter(Boolean),
        };
      });
  }

  const previa = parseLinhas(texto);
  const validos = previa.filter((p) => p.nome && /^https:\/\//i.test(p.link_afiliado || ""));
  const invalidos = previa.length - validos.length;
  const nomePlat = (id) => PLATAFORMAS.find((p) => p.id === id)?.nome || id;

  // Avança do texto pras fotos: "congela" os produtos válidos num estado
  // editável (a partir daqui dá pra adicionar/remover fotos de cada um).
  function irParaFotos() {
    setErro("");
    if (validos.length === 0) {
      setErro("Nenhuma linha válida. Cada linha precisa de nome e link começando com https://");
      return;
    }
    setItens(validos.map((p) => ({ ...p, imagens: [...(p.imagens || [])] })));
    setEtapa("fotos");
  }

  // ---- fotos por produto ----
  function todasFotos(it) {
    return [it.imagem_url, ...(it.imagens || [])].filter(Boolean);
  }
  function adicionarUrl(idx, u) {
    setItens((arr) =>
      arr.map((it, i) => {
        if (i !== idx) return it;
        if (!it.imagem_url) return { ...it, imagem_url: u };
        if (todasFotos(it).includes(u)) return it; // evita repetir
        return { ...it, imagens: [...(it.imagens || []), u] };
      })
    );
  }
  async function enviarFotos(idx, files) {
    setErroUpload("");
    setUploadIdx(idx);
    try {
      const urls = [];
      for (const f of files) urls.push(await reduzirEEnviarImagem(f));
      setItens((arr) =>
        arr.map((it, i) => {
          if (i !== idx) return it;
          let imagem_url = it.imagem_url;
          const imagens = [...(it.imagens || [])];
          for (const u of urls) {
            if (!imagem_url) imagem_url = u; // 1ª foto vira principal se não houver
            else if (u !== imagem_url && !imagens.includes(u)) imagens.push(u);
          }
          return { ...it, imagem_url, imagens };
        })
      );
    } catch (e) {
      setErroUpload(e.message || "Não consegui enviar uma das fotos.");
    } finally {
      setUploadIdx(null);
    }
  }
  function removerFoto(idx, url) {
    setItens((arr) =>
      arr.map((it, i) => {
        if (i !== idx) return it;
        if (it.imagem_url === url) {
          // removeu a principal: a 1ª da galeria assume o lugar
          const [nova, ...resto] = it.imagens || [];
          return { ...it, imagem_url: nova || "", imagens: resto };
        }
        return { ...it, imagens: (it.imagens || []).filter((u) => u !== url) };
      })
    );
  }
  function tornarPrincipal(idx, url) {
    setItens((arr) =>
      arr.map((it, i) => {
        if (i !== idx) return it;
        const antiga = it.imagem_url;
        const imagens = (it.imagens || []).filter((u) => u !== url);
        if (antiga && antiga !== url) imagens.unshift(antiga);
        return { ...it, imagem_url: url, imagens };
      })
    );
  }

  async function importar() {
    setErro("");
    if (itens.length === 0) {
      setErro("Nada para importar.");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/produtos/lote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produtos: itens }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || "Erro ao importar.");
      } else {
        setResultado(data);
        setTimeout(aoConcluir, 1400);
      }
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setEnviando(false);
    }
  }

  // Indicador das etapas (1 Texto · 2 Fotos · 3 Revisar)
  const Passos = () => {
    const passos = [
      { id: "texto", n: 1, nome: "Texto" },
      { id: "fotos", n: 2, nome: "Fotos" },
      { id: "revisar", n: 3, nome: "Revisar" },
    ];
    return (
      <div className="mb-4 flex items-center gap-2 text-xs">
        {passos.map((p, i) => {
          const ativo = etapa === p.id;
          return (
            <span key={p.id} className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${
                  ativo ? "bg-cc-ink text-white" : "bg-cc-cream text-cc-muted"
                }`}
              >
                <span
                  className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${
                    ativo ? "bg-white text-cc-ink" : "bg-white/70 text-cc-muted"
                  }`}
                >
                  {p.n}
                </span>
                {p.nome}
              </span>
              {i < passos.length - 1 ? <span className="text-cc-line">→</span> : null}
            </span>
          );
        })}
      </div>
    );
  };

  const itemPreview = previewIdx !== null ? itens[previewIdx] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-3xl rounded-2xl border border-cc-line bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="cc-mono text-2xl text-cc-ink">Adicionar vários produtos</h2>
          <button onClick={fechar} className="text-cc-muted hover:text-cc-ink" aria-label="Fechar">
            ✕
          </button>
        </div>

        <Passos />

        {/* sucesso */}
        {resultado ? (
          <div className="rounded-xl border border-br-green bg-[#F0FAF3] p-4 text-sm text-br-green">
            ✅ {resultado.adicionados} produto(s) adicionado(s)
            {resultado.ignorados ? ` · ${resultado.ignorados} ignorado(s)` : ""}.
          </div>
        ) : etapa === "texto" ? (
          /* ---------------- ETAPA 1: TEXTO ---------------- */
          <div className="space-y-3">
            <div className="border border-cc-line bg-cc-cream/60 p-3 text-xs text-cc-ink">
              <p className="font-semibold">Um produto por linha, separando os campos por “|”:</p>
              <p className="mt-1 font-mono text-[11px] leading-relaxed">
                Nome | Link | Preço | Preço antigo | Categoria | Plataforma | Nota | Avaliações |
                Imagem | Comissão % | Subcategoria
              </p>
              <p className="mt-2 text-cc-muted">
                Só <b>Nome</b> e <b>Link</b> são obrigatórios. O resto é opcional — deixe vazio entre
                as barras para pular. No campo <b>Imagem</b> dá pra colar várias URLs separadas por
                vírgula (a 1ª é a principal). <b>E não precisa se preocupar com as fotos agora:</b> no
                próximo passo dá pra enviar/adicionar fotos em cada produto.
              </p>
              <p className="mt-2 break-all font-mono text-[11px] text-cc-muted">
                Fone TWS | https://shopee.com.br/abc | 89.90 | 149.90 | eletronicos | shopee | 4.8 |
                1240 | https://img.jpg | 12
              </p>
            </div>

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

            {validos.length > 0 ? (
              <div className="max-h-56 overflow-auto rounded-lg border border-cc-line">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-cc-cream/80 text-[11px] uppercase tracking-wide text-cc-muted">
                    <tr>
                      <th className="px-2 py-1.5 font-medium">Nome</th>
                      <th className="px-2 py-1.5 font-medium">Preço</th>
                      <th className="px-2 py-1.5 font-medium">Categoria</th>
                      <th className="px-2 py-1.5 font-medium">Plataforma</th>
                      {!modoDrop ? <th className="px-2 py-1.5 font-medium">Ganho/venda</th> : null}
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
                        {!modoDrop ? (
                          <td className="px-2 py-1.5 text-br-green">
                            {p.preco && p.comissao_percent
                              ? `${formatarPreco(
                                  (Number(p.preco) * Number(p.comissao_percent)) / 100
                                )} (${p.comissao_percent}%)`
                              : "—"}
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {erro ? <p className="bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={irParaFotos}
                disabled={validos.length === 0}
                className="flex-1 bg-cc-yellow px-4 py-2.5 text-sm font-bold text-cc-ink transition hover:bg-cc-yellow-dark disabled:opacity-60"
              >
                Avançar para as fotos →
              </button>
              <button
                type="button"
                onClick={fechar}
                className="border border-cc-line px-5 py-2.5 text-sm font-medium text-cc-muted hover:text-cc-ink"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : etapa === "fotos" ? (
          /* ---------------- ETAPA 2: FOTOS ---------------- */
          <div className="space-y-3">
            <p className="text-xs text-cc-muted">
              Adicione quantas fotos quiser em cada produto (envie do computador ou cole URLs). A
              foto marcada como <b>principal</b> é a que aparece nos cards; as outras formam a
              galeria na página do produto. Clique em <b>★</b> para trocar a principal.
            </p>
            {erroUpload ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{erroUpload}</p>
            ) : null}

            <div className="max-h-[55vh] space-y-2.5 overflow-y-auto pr-1">
              {itens.map((it, idx) => {
                const fotos = todasFotos(it);
                return (
                  <div key={idx} className="rounded-xl border border-cc-line p-3">
                    <p className="mb-2 truncate text-sm font-medium text-cc-ink">
                      {idx + 1}. {it.nome}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {fotos.map((url, fi) => (
                        <div key={url} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt=""
                            className="h-16 w-16 rounded-lg border border-cc-line object-cover"
                          />
                          {fi === 0 ? (
                            <span className="absolute left-1 top-1 rounded bg-cc-ink/85 px-1 text-[9px] font-bold text-white">
                              principal
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => tornarPrincipal(idx, url)}
                              title="Tornar principal"
                              className="absolute left-1 top-1 grid h-5 w-5 place-items-center rounded bg-white/90 text-[11px] text-cc-ink shadow"
                            >
                              ★
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removerFoto(idx, url)}
                            aria-label="Remover foto"
                            className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-cc-ink text-[10px] text-white shadow"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {fotos.length === 0 ? (
                        <span className="text-xs text-cc-muted">Sem foto ainda</span>
                      ) : null}
                      <label className="grid h-16 w-16 cursor-pointer place-items-center rounded-lg border border-dashed border-cc-line text-center text-[10px] font-medium text-cc-muted transition hover:bg-cc-cream">
                        {uploadIdx === idx ? "Enviando..." : "📷 + Fotos"}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={uploadIdx === idx}
                          className="hidden"
                          onChange={(e) => {
                            const fs = Array.from(e.target.files || []);
                            e.target.value = "";
                            if (fs.length) enviarFotos(idx, fs);
                          }}
                        />
                      </label>
                    </div>
                    <AdicionarUrl aoAdicionar={(u) => adicionarUrl(idx, u)} />
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEtapa("texto")}
                className="border border-cc-line px-5 py-2.5 text-sm font-medium text-cc-muted hover:text-cc-ink"
              >
                ← Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  setErro("");
                  setEtapa("revisar");
                }}
                className="flex-1 bg-cc-yellow px-4 py-2.5 text-sm font-bold text-cc-ink transition hover:bg-cc-yellow-dark"
              >
                Avançar para a revisão →
              </button>
            </div>
          </div>
        ) : (
          /* ---------------- ETAPA 3: REVISAR ---------------- */
          <div className="space-y-3">
            <p className="text-xs text-cc-muted">
              Tudo certo? Clique em <b>👁 Preview</b> pra ver como cada produto vai ficar (com a
              galeria de fotos). Depois é só importar.
            </p>

            <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
              {itens.map((it, idx) => {
                const fotos = todasFotos(it);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-xl border border-cc-line p-2.5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.imagem_url || "https://placehold.co/64x64/FFF8EC/211C15?text=CC"}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-lg border border-cc-line object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-cc-ink">{it.nome}</p>
                      <p className="text-xs text-cc-muted">
                        {it.preco ? `R$ ${it.preco}` : "sem preço"} ·{" "}
                        {fotos.length} foto{fotos.length === 1 ? "" : "s"}
                        {fotos.length === 0 ? " ⚠️" : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewIdx(idx)}
                      className="shrink-0 rounded-lg border border-cc-line px-3 py-1.5 text-xs font-medium text-cc-ink transition hover:bg-cc-cream"
                    >
                      👁 Preview
                    </button>
                  </div>
                );
              })}
            </div>

            {erro ? <p className="bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEtapa("fotos")}
                className="border border-cc-line px-5 py-2.5 text-sm font-medium text-cc-muted hover:text-cc-ink"
              >
                ← Voltar
              </button>
              <button
                type="button"
                onClick={importar}
                disabled={enviando || itens.length === 0}
                className="flex-1 bg-cc-yellow px-4 py-2.5 text-sm font-bold text-cc-ink transition hover:bg-cc-yellow-dark disabled:opacity-60"
              >
                {enviando ? "Importando..." : `Importar ${itens.length} produto(s)`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- PREVIEW de um produto ---------------- */}
      {itemPreview ? (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4"
          onClick={() => setPreviewIdx(null)}
        >
          <div
            className="my-8 w-full max-w-md rounded-2xl border border-cc-line bg-white p-5 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-cc-muted">
                Pré-visualização
              </span>
              <button
                onClick={() => setPreviewIdx(null)}
                className="text-cc-muted hover:text-cc-ink"
                aria-label="Fechar preview"
              >
                ✕
              </button>
            </div>

            <Galeria
              principal={itemPreview.imagem_url}
              imagens={itemPreview.imagens}
              alt={itemPreview.nome}
            />

            <div className="mt-4">
              <PlatformBadge plataforma={itemPreview.plataforma} className="mb-2" />
              <h3 className="text-lg font-semibold leading-snug text-cc-ink">{itemPreview.nome}</h3>
              <div className="mt-2 flex flex-wrap items-end gap-2">
                {itemPreview.preco ? (
                  <span className="cc-mono text-2xl leading-none text-cc-ink">
                    {formatarPreco(itemPreview.preco)}
                  </span>
                ) : (
                  <span className="text-sm text-cc-muted">Ver preço na loja</span>
                )}
                {itemPreview.preco_antigo &&
                Number(itemPreview.preco_antigo) > Number(itemPreview.preco) ? (
                  <span className="text-sm font-semibold leading-none text-[#C0392B] line-through">
                    {formatarPreco(itemPreview.preco_antigo)}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-cc-muted">
                {nomeCategoria(itemPreview.categoria, categorias)}
                {itemPreview.nota ? ` · ★ ${itemPreview.nota}` : ""}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
