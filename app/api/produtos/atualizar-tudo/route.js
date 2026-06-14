import { NextResponse } from "next/server";
import { tokenSessao } from "@/lib/auth";
import { atualizarProdutosML } from "@/lib/atualizarProdutos";
import { revalidarProdutos } from "@/lib/revalidar";

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
  const bloqueados = resultados.filter((r) => r.status === "bloqueado").length;
  const semMudanca = resultados.filter((r) => r.status === "sem-mudanca").length;

  if (atualizados > 0) revalidarProdutos();

  return NextResponse.json({
    total: resultados.length,
    atualizados,
    bloqueados,
    semMudanca,
  });
}
