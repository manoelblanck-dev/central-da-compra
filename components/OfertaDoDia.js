"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LinkOferta from "@/components/LinkOferta";
import { formatarPreco } from "@/lib/constantes";

// Quanto falta até a próxima troca. Se vier `terminaEm` (fila manual de ofertas),
// conta até esse horário — e, ao passar, rola para o próximo intervalo, então o
// relógio nunca fica "zerado" esperando o cache atualizar o produto. Sem
// `terminaEm`, conta até a meia-noite (comportamento antigo/automático).
function calcularFalta(terminaEm, intervaloMs) {
  if (!terminaEm) {
    const fim = new Date();
    fim.setHours(23, 59, 59, 999);
    return fim.getTime() - Date.now();
  }
  let alvo = terminaEm;
  const agora = Date.now();
  if (intervaloMs && intervaloMs > 0) {
    while (alvo <= agora) alvo += intervaloMs;
  }
  return alvo - agora;
}

function Relogio({ terminaEm = null, intervaloMs = null }) {
  const [ms, setMs] = useState(null);

  useEffect(() => {
    setMs(calcularFalta(terminaEm, intervaloMs));
    const t = setInterval(() => setMs(calcularFalta(terminaEm, intervaloMs)), 1000);
    return () => clearInterval(t);
  }, [terminaEm, intervaloMs]);

  // Antes de o navegador calcular (e na renderização do servidor), mostra um
  // placeholder em vez de "00:00:00" — que parece um timer quebrado/zerado.
  if (ms === null) {
    return (
      <span className="cc-mono tabular-nums text-base font-semibold text-cc-muted">
        --:--:--
      </span>
    );
  }

  const p = (x) => String(Math.max(0, x)).padStart(2, "0");
  let d = Math.max(0, ms);
  const h = Math.floor(d / 3600000);
  d -= h * 3600000;
  const m = Math.floor(d / 60000);
  d -= m * 60000;
  const s = Math.floor(d / 1000);

  return (
    <span className="cc-mono tabular-nums text-base font-semibold text-cc-ink">
      {p(h)}:{p(m)}:{p(s)}
    </span>
  );
}

// Card de destaque "Oferta do dia" — recebe o produto escolhido no servidor
// (fila manual do painel ou, no automático, o mais clicado). `terminaEm` é o
// horário da próxima troca; `intervaloMs`, a duração de cada oferta da fila.
export default function OfertaDoDia({ produto, terminaEm = null, intervaloMs = null }) {
  if (!produto) return null;

  const preco = formatarPreco(produto.preco);
  const precoAntigo = formatarPreco(produto.preco_antigo);
  const temDesconto =
    produto.preco_antigo && Number(produto.preco_antigo) > Number(produto.preco);
  const desconto = temDesconto
    ? Math.round((1 - Number(produto.preco) / Number(produto.preco_antigo)) * 100)
    : null;

  return (
    <section className="mt-6">
      <div className="overflow-hidden rounded-3xl border border-cc-line bg-[linear-gradient(135deg,#FFF6E6_0%,#FBF3E8_100%)]">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-7 sm:p-7">
          {/* imagem */}
          <Link
            href={`/produto/${produto.id}`}
            className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-white sm:h-44 sm:w-44"
          >
            <Image
              src={produto.imagem_url || "/logo.png"}
              alt={produto.nome}
              fill
              sizes="(max-width: 640px) 100vw, 176px"
              className="object-cover"
            />
            {desconto ? (
              <span className="absolute left-2.5 top-2.5 rounded-full bg-cc-ink/85 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                -{desconto}%
              </span>
            ) : null}
          </Link>

          {/* infos */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cc-yellow px-3 py-1 text-xs font-bold text-cc-ink">
                🔥 Oferta do dia
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-cc-muted">
                Acaba em <Relogio terminaEm={terminaEm} intervaloMs={intervaloMs} />
              </span>
            </div>

            <h2 className="mt-3 line-clamp-2 text-lg font-semibold leading-snug text-cc-ink sm:text-xl">
              <Link href={`/produto/${produto.id}`} className="hover:underline">
                {produto.nome}
              </Link>
            </h2>

            <div className="mt-2 flex flex-wrap items-end gap-2.5">
              {preco ? (
                <span className="cc-mono text-2xl leading-none text-cc-ink sm:text-3xl">
                  {preco}
                </span>
              ) : (
                <span className="text-base text-cc-muted">Ver preço na loja</span>
              )}
              {precoAntigo && temDesconto ? (
                <span className="text-sm font-semibold leading-none text-[#C0392B] line-through">
                  {precoAntigo}
                </span>
              ) : null}
            </div>

            <LinkOferta
              id={produto.id}
              valor={produto.preco}
              className="mt-4 inline-block w-full rounded-xl bg-cc-ink px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-black active:translate-y-px sm:w-auto"
            >
              Ver Oferta →
            </LinkOferta>
          </div>
        </div>
      </div>
    </section>
  );
}
