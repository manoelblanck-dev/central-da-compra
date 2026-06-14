import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolverIdML, buscarPrecoML } from "@/lib/mercadoLivre";

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

  const { data: produtos, error } = await supabaseAdmin
    .from("produtos")
    .select("id, preco, link_afiliado, ml_item_id")
    .eq("plataforma", "mercado_livre");

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  const resultados = [];

  for (const produto of produtos || []) {
    try {
      const itemId = produto.ml_item_id || (await resolverIdML(produto.link_afiliado));
      if (!itemId) {
        resultados.push({ id: produto.id, status: "sem-id" });
        continue;
      }

      const precoAtual = await buscarPrecoML(itemId);
      if (precoAtual === null) {
        resultados.push({ id: produto.id, status: "sem-preco" });
        continue;
      }

      const atualizacao = {};
      if (itemId !== produto.ml_item_id) atualizacao.ml_item_id = itemId;

      const precoAnterior = produto.preco === null ? null : Number(produto.preco);
      if (precoAtual !== precoAnterior) {
        atualizacao.preco = precoAtual;
        // Só mostra "preço antigo" (tachado) quando o preço cai.
        // Se subiu, o desconto antigo deixou de fazer sentido.
        atualizacao.preco_antigo = precoAtual < precoAnterior ? precoAnterior : null;
      }

      if (Object.keys(atualizacao).length > 0) {
        await supabaseAdmin.from("produtos").update(atualizacao).eq("id", produto.id);
      }

      resultados.push({ id: produto.id, status: "ok", preco: precoAtual });
    } catch (e) {
      resultados.push({ id: produto.id, status: "erro", erro: String(e?.message || e) });
    }
  }

  return NextResponse.json({ ok: true, total: produtos?.length || 0, resultados });
}
