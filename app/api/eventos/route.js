import { NextResponse } from "next/server";

// API de Conversões da Meta (CAPI): recebe um evento do navegador e o reenvia
// pelo SERVIDOR para a Meta. Junto com o pixel do navegador, isso recupera os
// ~30% de eventos que bloqueadores/iPhone derrubam e melhora a otimização.
//
// Configuração (na Vercel, em Settings → Environment Variables):
//   META_CAPI_TOKEN        -> token gerado no Gerenciador de Eventos (obrigatório)
//   NEXT_PUBLIC_META_PIXEL_ID -> já existe (o id do pixel)
//   META_CAPI_TEST_CODE    -> opcional, só para a aba "Eventos de teste"
//
// Sem o token, a rota não faz nada (não quebra o site).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.META_PIXEL_ID;
const TOKEN = process.env.META_CAPI_TOKEN;
const TEST_CODE = process.env.META_CAPI_TEST_CODE;
const API = "https://graph.facebook.com/v21.0";

export async function POST(request) {
  // Sem pixel/token configurado: ignora silenciosamente (site segue normal).
  if (!PIXEL_ID || !TOKEN) {
    return NextResponse.json({ ok: true, ignorado: true });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const evento = (body?.evento || "").toString().slice(0, 60);
  if (!evento) return NextResponse.json({ ok: false }, { status: 400 });

  // Dados que ajudam a Meta a casar o evento com a pessoa (sem dados pessoais
  // nossos): IP, navegador e os cookies que o próprio pixel cria (_fbp/_fbc).
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined;
  const ua = request.headers.get("user-agent") || undefined;
  const fbp = request.cookies.get("_fbp")?.value;
  const fbc = request.cookies.get("_fbc")?.value;

  const userData = { client_ip_address: ip, client_user_agent: ua };
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const evt = {
    event_name: evento,
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    user_data: userData,
  };
  if (body.eventId) evt.event_id = String(body.eventId); // deduplicação
  if (body.url) evt.event_source_url = String(body.url).slice(0, 1000);
  // custom_data (valor, moeda, content_ids...) vem do mesmo objeto do pixel.
  if (body.dados && typeof body.dados === "object" && !Array.isArray(body.dados)) {
    evt.custom_data = body.dados;
  }

  const payload = { data: [evt] };
  if (TEST_CODE) payload.test_event_code = TEST_CODE;

  try {
    const res = await fetch(`${API}/${PIXEL_ID}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, access_token: TOKEN }),
    });
    // Best-effort: mesmo se a Meta recusar, não atrapalhamos o usuário.
    if (!res.ok) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  return NextResponse.json({ ok: true });
}
