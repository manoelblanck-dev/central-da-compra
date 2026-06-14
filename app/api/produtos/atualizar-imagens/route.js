import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { tokenSessao } from "@/lib/auth";
import { resolverIdML, buscarDadosML } from "@/lib/mercadoLivre";

async function autorizado(request) {
  const cookie = request.cookies.get("cc_admin")?.value;
  if (!cookie || !process.env.ADMIN_PASSWORD) return false;
  return cookie === (await tokenSessao());
}

// Preenche nome, preço e imagem dos produtos do Mercado Livre que ainda
// estão sem imagem (cadastrados antes da busca automática existir).
export async function POST(request) {
  if (!(await autorizado(request))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const { data: produtos, error } = await supabaseAdmin
    .from("produtos")
    .select("id, nome, preco, imagem_url, link_afiliado, ml_item_id")
    .eq("plataforma", "mercado_livre")
    .or("imagem_url.is.null,imagem_url.eq.");

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  let atualizados = 0;
  let semDados = 0;

  for (const produto of produtos || []) {
    try {
      const itemId = produto.ml_item_id || (await resolverIdML(produto.link_afiliado));
      if (!itemId) {
        semDados++;
        continue;
      }

      const dados = await buscarDadosML(itemId);
      if (!dados || !dados.imagem_url) {
        semDados++;
        continue;
      }

      const atualizacao = { imagem_url: dados.imagem_url };
      if (itemId !== produto.ml_item_id) atualizacao.ml_item_id = itemId;
      if (!produto.nome && dados.nome) atualizacao.nome = dados.nome;
      if (produto.preco === null && dados.preco !== null) atualizacao.preco = dados.preco;

      await supabaseAdmin.from("produtos").update(atualizacao).eq("id", produto.id);
      atualizados++;
    } catch {
      semDados++;
    }
  }

  return NextResponse.json({ total: produtos?.length || 0, atualizados, semDados });
}
