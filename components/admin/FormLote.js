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

export default function FormLote({ fechar, aoConcluir, categorias = CATEGORIAS }) {
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
          subcategoria: subcategoria ? gerarSlug(subcategoria) : "",
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
            | Comissão % | Subcategoria
          </p>
          <p className="mt-2 text-cc-muted">
            Só <b>Nome</b> e <b>Link</b> são obrigatórios. O resto é opcional — deixe vazio entre
            as barras para pular (ex.: <span className="font-mono">Nome | Link | | | casa</span>). A
            <b> plataforma</b> é detectada pelo link se ficar vazia. A <b>categoria</b> pode ser o
            nome ou o atalho dela (use a aba “Categorias” para criar novas antes). No campo{" "}
            <b>Imagem</b>, dá pra colar várias URLs separadas por vírgula (a 1ª é a principal, o
            resto vira galeria). A <b>subcategoria</b> (último campo, opcional) deve existir na
            categoria escolhida — crie-as antes na aba “Categorias”.
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

