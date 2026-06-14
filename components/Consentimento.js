"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Pixels from "@/components/Pixels";

const KEY = "cc_consent"; // "aceito" | "recusado"

// Banner de consentimento de cookies (LGPD).
// - Os pixels de rastreamento (Meta/TikTok) só são carregados DEPOIS que a
//   pessoa clica em "Aceitar". Isso respeita a LGPD e é exigido para aprovar
//   campanhas de tráfego pago.
// - A escolha fica guardada no navegador (não pergunta de novo).
export default function Consentimento() {
  // null = ainda lendo o navegador; depois vira "aceito" | "recusado" | "pendente"
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    let salvo = null;
    try {
      salvo = localStorage.getItem(KEY);
    } catch {
      /* ignora */
    }
    setEstado(salvo === "aceito" || salvo === "recusado" ? salvo : "pendente");
  }, []);

  function decidir(valor) {
    try {
      localStorage.setItem(KEY, valor);
    } catch {
      /* ignora */
    }
    setEstado(valor);
  }

  // Enquanto não leu o navegador, não mostra nada (evita o banner "piscar").
  if (estado === null) return null;

  return (
    <>
      {/* Pixels só carregam após o aceite */}
      {estado === "aceito" ? <Pixels /> : null}

      {estado === "pendente" ? (
        <div className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-4">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-cc-line bg-white p-4 shadow-cardlg sm:flex-row sm:items-center sm:gap-4">
            <p className="flex-1 text-sm leading-relaxed text-cc-ink">
              Usamos cookies para medir a audiência e mostrar as melhores ofertas pra você.
              Veja nossa{" "}
              <Link href="/privacidade" className="font-semibold underline">
                Política de Privacidade
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => decidir("recusado")}
                className="flex-1 rounded-xl border border-cc-line px-4 py-2.5 text-sm font-semibold text-cc-muted transition hover:text-cc-ink sm:flex-none"
              >
                Recusar
              </button>
              <button
                onClick={() => decidir("aceito")}
                className="flex-1 rounded-xl bg-cc-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black sm:flex-none"
              >
                Aceitar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
