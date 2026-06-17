"use client";

import { WHATSAPP_URL, TELEGRAM_URL } from "@/lib/constantes";
import { rastrearEvento } from "@/lib/pixel";

// Ícone do WhatsApp.
function IconeWhats({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15c-1.52 0-3.01-.41-4.3-1.18l-.31-.18-3.12.82.83-3.04-.2-.31a8.21 8.21 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.25-8.25 8.25zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" />
    </svg>
  );
}

// Ícone do Telegram (aviãozinho).
function IconeTelegram({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M21.94 4.66a1.2 1.2 0 0 0-1.2-.2L3.3 11.2c-.86.33-.85.95-.15 1.16l4.5 1.4 1.74 5.25c.2.55.34.76.66.76.31 0 .45-.14.62-.32l2.1-2.04 4.36 3.22c.8.44 1.38.21 1.58-.74l2.86-13.49c.13-.6-.06-.95-.4-1.18zm-3.7 2.42-8.4 7.6-.33 3.5-1.6-4.84 9.78-6.1c.45-.28.86-.13.55.16z" />
    </svg>
  );
}

// Avisa os pixels que alguém entrou num canal (evento de conversão "Subscribe").
// Vale pro WhatsApp e pro Telegram — os dois são "virar seguidor".
function aoEntrar() {
  rastrearEvento("Subscribe", { meta: {}, tiktok: {} });
}

// Convite para os canais de ofertas (WhatsApp + Telegram). Cada canal só
// aparece se o link dele estiver preenchido em lib/constantes.js.
// `variante`: "faixa" (banner grande, ex.: home/produto) ou "botao" (compacto,
// ex.: rodapé/Sobre).
export default function CanaisOfertas({ variante = "botao", className = "" }) {
  const temWhats = !!WHATSAPP_URL;
  const temTelegram = !!TELEGRAM_URL;
  if (!temWhats && !temTelegram) return null;

  const baseBtn =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition active:translate-y-px";

  const botaoWhats = temWhats ? (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={aoEntrar}
      className={`${baseBtn} bg-[#25D366] hover:bg-[#1FB457]`}
    >
      <IconeWhats className="h-4 w-4" />
      WhatsApp
    </a>
  ) : null;

  const botaoTelegram = temTelegram ? (
    <a
      href={TELEGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={aoEntrar}
      className={`${baseBtn} bg-[#229ED9] hover:bg-[#1B8AC0]`}
    >
      <IconeTelegram className="h-4 w-4" />
      Telegram
    </a>
  ) : null;

  if (variante === "faixa") {
    return (
      <section className={`mt-10 ${className}`}>
        <div className="flex flex-col items-start gap-4 rounded-3xl border border-cc-line bg-[linear-gradient(135deg,#FFF6E6_0%,#FFFFFF_60%)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3.5">
            <span className="flex shrink-0 -space-x-2">
              {temWhats ? (
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#25D366] text-white ring-2 ring-white">
                  <IconeWhats className="h-6 w-6" />
                </span>
              ) : null}
              {temTelegram ? (
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#229ED9] text-white ring-2 ring-white">
                  <IconeTelegram className="h-6 w-6" />
                </span>
              ) : null}
            </span>
            <div>
              <p className="text-base font-semibold text-cc-ink">
                Receba as ofertas no seu celular
              </p>
              <p className="mt-0.5 text-sm text-cc-muted">
                As melhores promoções do dia, no WhatsApp ou Telegram. É grátis.
              </p>
            </div>
          </div>
          <div className="flex w-full shrink-0 gap-2 sm:w-auto [&>a]:flex-1 sm:[&>a]:flex-none">
            {botaoWhats}
            {botaoTelegram}
          </div>
        </div>
      </section>
    );
  }

  // variante "botao" (compacto) — os dois lado a lado
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {botaoWhats}
      {botaoTelegram}
    </div>
  );
}
