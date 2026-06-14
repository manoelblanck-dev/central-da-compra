import { NextResponse } from "next/server";
import { atualizarProdutosML } from "@/lib/atualizarProdutos";
import { revalidarProdutos } from "@/lib/revalidar";

// Sempre executar de verdade (sem cache), nunca em build.
export const dynamic = "force-dynamic";

// A Vercel chama esta rota com "Authorization: Bearer <CRON_SECRET>".
// Bloqueia qualquer outra chamada (ex: alguém de fora tentando disparar o job).
function autorizado(request) {
  const esperado = process.env.CRON_SECRET;
  if (!esperado) return false;
  return request.headers.get("authorization") === `Bearer ${esperado}`;
}

export async function GET(request) {
  if (!autorizado(request)) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const resultados = await atualizarProdutosML();
  if (resultados.some((r) => r.status === "ok")) revalidarProdutos();
  return NextResponse.json({ ok: true, total: resultados.length, resultados });
}
