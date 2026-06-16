import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { enviarProdutoTelegram } from "@/lib/telegram";

// Cron de disparos no Telegram. A Vercel chama de hora em hora (ver vercel.json);
// aqui a gente verifica se já passou o intervalo configurado (padrão 3h) e, se
// passou, envia o próximo produto da fila. Assim o intervalo é editável no painel
// sem precisar mexer no agendamento da Vercel.
export const dynamic = "force-dynamic";

function autorizado(request) {
  const esperado = process.env.CRON_SECRET;
  if (!esperado) return false;
  return request.headers.get("authorization") === `Bearer ${esperado}`;
}

export async function GET(request) {
  if (!autorizado(request)) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return NextResponse.json({ ok: true, ignorado: "Telegram não configurado." });
  }

  // Lê a fila de disparos salva no painel.
  const { data: cfg } = await supabaseAdmin
    .from("config")
    .select("valor")
    .eq("chave", "disparos_telegram")
    .maybeSingle();

  const conf = cfg?.valor || {};
  const fila = Array.isArray(conf.produtos) ? conf.produtos.filter(Boolean) : [];
  if (!conf.ativo || fila.length === 0) {
    return NextResponse.json({ ok: true, ignorado: "Disparos desligados ou fila vazia." });
  }

  const horas = Number(conf.horas) > 0 ? Number(conf.horas) : 3;
  const intervalo = horas * 3600 * 1000;
  const ultimo = conf.ultimo_envio ? Date.parse(conf.ultimo_envio) : null;
  const agora = Date.now();

  // Ainda não chegou a hora do próximo disparo.
  if (ultimo && agora - ultimo < intervalo) {
    return NextResponse.json({ ok: true, aguardando: true });
  }

  // Índice do próximo a enviar (procura o 1º que ainda existe, pulando removidos).
  let idx = Number.isInteger(conf.idx) && conf.idx >= 0 ? conf.idx % fila.length : 0;
  let produto = null;
  for (let i = 0; i < fila.length; i++) {
    const cand = (idx + i) % fila.length;
    const { data: p } = await supabaseAdmin
      .from("produtos")
      .select("*")
      .eq("id", fila[cand])
      .maybeSingle();
    if (p) {
      produto = p;
      idx = cand;
      break;
    }
  }

  if (!produto) {
    return NextResponse.json({ ok: true, ignorado: "Nenhum produto válido na fila." });
  }

  const envio = await enviarProdutoTelegram(produto, { token, chatId });
  if (!envio.ok) {
    // Não avança a fila se falhou — tenta de novo no próximo ciclo.
    return NextResponse.json({ ok: false, erro: envio.erro }, { status: 200 });
  }

  // Avança o índice. Ao chegar no fim: repete do início, ou desliga (repetir=false).
  let proximo = idx + 1;
  let ativo = true;
  if (proximo >= fila.length) {
    proximo = 0;
    if (conf.repetir === false) ativo = false;
  }

  await supabaseAdmin.from("config").upsert(
    {
      chave: "disparos_telegram",
      valor: { ...conf, idx: proximo, ultimo_envio: new Date(agora).toISOString(), ativo },
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: "chave" }
  );

  return NextResponse.json({ ok: true, enviado: produto.nome });
}
