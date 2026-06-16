import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { tokenSessao } from "@/lib/auth";
import { enviarProdutoTelegram } from "@/lib/telegram";

// "Enviar agora" do painel: dispara um produto escolhido no Telegram na hora,
// pra testar sem esperar o cron. Só admin.
export const dynamic = "force-dynamic";

async function autorizado(request) {
  const cookie = request.cookies.get("cc_admin")?.value;
  if (!cookie || !process.env.ADMIN_PASSWORD) return false;
  return cookie === (await tokenSessao());
}

export async function POST(request) {
  if (!(await autorizado(request))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return NextResponse.json(
      {
        erro: "O bot do Telegram ainda não está configurado na Vercel (TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID).",
      },
      { status: 400 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Envio inválido." }, { status: 400 });
  }

  const id = body?.id;
  if (!id) return NextResponse.json({ erro: "Escolha um produto." }, { status: 400 });

  const { data: produto } = await supabaseAdmin
    .from("produtos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!produto) return NextResponse.json({ erro: "Produto não encontrado." }, { status: 404 });

  const envio = await enviarProdutoTelegram(produto, { token, chatId });
  if (!envio.ok) return NextResponse.json({ erro: envio.erro }, { status: 400 });
  return NextResponse.json({ ok: true });
}
