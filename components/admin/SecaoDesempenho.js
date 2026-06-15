"use client";

import { useState, useEffect } from "react";
import Metrica from "@/components/admin/Metrica";

export default function SecaoDesempenho() {
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

