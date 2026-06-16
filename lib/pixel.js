// Disparo de eventos nos pixels da Meta (Facebook/Instagram) e do TikTok.
//
// Além do pixel do NAVEGADOR, mandamos o MESMO evento pelo SERVIDOR (API de
// Conversões da Meta — ver app/api/eventos/route.js). Por quê: bloqueadores de
// anúncio e iPhone derrubam ~30% dos eventos do pixel do navegador; o envio pelo
// servidor recupera esses casos e melhora a otimização dos anúncios.
//
// Para a Meta NÃO contar o mesmo evento duas vezes, geramos um `event_id` único
// e mandamos ele nos DOIS caminhos (navegador via `eventID` + servidor via
// `event_id`). A Meta junta os dois e conta como UM só (deduplicação).
//
// Tudo aqui só roda DEPOIS que a pessoa aceita os cookies (LGPD).

// Gera um id único para o evento (usado na deduplicação navegador↔servidor).
function novoEventId() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* ignora */
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// A pessoa aceitou os cookies? (mesma chave usada em components/Consentimento.js)
function consentido() {
  try {
    return localStorage.getItem("cc_consent") === "aceito";
  } catch {
    return false;
  }
}

// Envia o evento pelo SERVIDOR (CAPI). "Best-effort": não trava nada e nunca
// quebra a navegação. `keepalive` garante o envio mesmo se a página fechar logo
// depois (ex.: clique em "Ver Oferta" que abre a loja em outra aba).
export function enviarCapi(evento, eventId, dados) {
  if (typeof window === "undefined" || !consentido()) return;
  try {
    fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evento, eventId, url: window.location.href, dados: dados || {} }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignora */
  }
}

// Dispara um evento padrão (mesmo nome na Meta e no TikTok, ex.: "ViewContent",
// "AddToWishlist", "Subscribe"). Os parâmetros têm formatos um pouco diferentes
// em cada plataforma, por isso vêm separados.
export function rastrearEvento(evento, { meta = {}, tiktok = {} } = {}) {
  const eventId = novoEventId();
  try {
    if (typeof window !== "undefined" && window.fbq) {
      // O 4º argumento ({ eventID }) é o que permite a deduplicação com a CAPI.
      window.fbq("track", evento, meta, { eventID: eventId });
    }
  } catch {
    /* pixel da Meta não instalado */
  }
  try {
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.track(evento, tiktok);
    }
  } catch {
    /* pixel do TikTok não instalado */
  }
  // Mesmo evento, pelo servidor (Meta CAPI) — deduplicado pelo eventId.
  enviarCapi(evento, eventId, meta);
}

// Versão para quando o nome do evento difere entre Meta e TikTok (ex.: o clique
// em "Ver Oferta" é "Lead" na Meta e "ClickButton" no TikTok). Cuida da
// deduplicação da Meta e do envio pela CAPI. Retorna nada.
export function rastrearLead({ metaEvento, ttqEvento, meta = {}, tiktok = {} }) {
  const eventId = novoEventId();
  try {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", metaEvento, meta, { eventID: eventId });
    }
  } catch {
    /* pixel da Meta não instalado */
  }
  try {
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.track(ttqEvento, tiktok);
    }
  } catch {
    /* pixel do TikTok não instalado */
  }
  enviarCapi(metaEvento, eventId, meta);
}
