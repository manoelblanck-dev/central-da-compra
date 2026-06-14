import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { tokenSessao } from "@/lib/auth";
import { revalidarProdutos } from "@/lib/revalidar";

async function autorizado(request) {
  const cookie = request.cookies.get("cc_admin")?.value;
  if (!cookie || !process.env.ADMIN_PASSWORD) return false;
  return cookie === (await tokenSessao());
}

// GET /api/config?chave=proximo_jogo  -> lê uma configuração
export async function GET(request) {
  const chave = request.nextUrl.searchParams.get("chave");
  if (!chave) {
    return NextResponse.json({ erro: "Informe a chave." }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin
    .from("config")
    .select("valor")
    .eq("chave", chave)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 400 });
  }
  return NextResponse.json({ valor: data?.valor ?? null });
}

// POST /api/config  { chave, valor }  -> salva (só admin)
export async function POST(request) {
  if (!(await autorizado(request))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Envio inválido." }, { status: 400 });
  }

  const chave = (body?.chave || "").toString().trim();
  if (!chave) {
    return NextResponse.json({ erro: "Informe a chave." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("config")
    .upsert(
      { chave, valor: body.valor ?? null, atualizado_em: new Date().toISOString() },
      { onConflict: "chave" }
    );

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 400 });
  }
  // Cupons e próximo jogo aparecem na home e nas páginas de produto.
  revalidarProdutos();
  return NextResponse.json({ ok: true });
}
