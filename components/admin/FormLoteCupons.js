"use client";

import { useState } from "react";

export default function FormLoteCupons({ listaAtual = [], fechar, aoConcluir }) {
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
