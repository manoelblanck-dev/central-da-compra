// Dispara um evento de rastreamento nos pixels da Meta (Facebook/Instagram)
// e do TikTok, SE eles estiverem carregados. Os pixels só carregam depois que
// a pessoa aceita os cookies (ver components/Consentimento.js), então aqui é
// sempre seguro chamar: se o pixel não existir, simplesmente não faz nada.
//
// Use o mesmo nome de evento padrão (ex.: "ViewContent", "AddToWishlist"),
// que tanto a Meta quanto o TikTok reconhecem. Os parâmetros têm formatos
// um pouco diferentes em cada plataforma, por isso são passados separados.
export function rastrearEvento(evento, { meta = {}, tiktok = {} } = {}) {
  try {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", evento, meta);
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
}
