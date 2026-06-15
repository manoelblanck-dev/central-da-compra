"use client";

import { useState, useEffect } from "react";

export default function SecaoProximoJogo() {
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

