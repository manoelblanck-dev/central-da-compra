import { NextResponse } from "next/server";
import { tokenSessao } from "@/lib/auth";
import { atualizarProdutosML } from "@/lib/atualizarProdutos";

export const dynamic = "force-dynamic";

async function autorizado(request) {
  const cookie = request.cookies.get("cc_admin")?.value;
  if (!cookie || !process.env.ADMIN_PASSWORD) return false;
  return cookie === (await tokenSessao());
}

// Atualiza preço, nota e avaliações de todos os produtos do Mercado Livre,
// disparado manualmente pelo botão "Atualizar tudo agora" no painel.
export async function POST(request) {
  if (!(await autorizado(request))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const resultados = await atualizarProdutosML();
  const atualizados = resultados.filter((r) => r.status === "ok").length;
  const semDados = resultados.length - atualizados;

  return NextResponse.json({ total: resultados.length, atualizados, semDados });
}
