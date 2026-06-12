import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const id = params.id;

  // Busca o link de afiliado do produto
  const { data: produto } = await supabase
    .from("produtos")
    .select("link_afiliado, cliques")
    .eq("id", id)
    .single();

  if (!produto || !produto.link_afiliado) {
    // Produto não encontrado: volta pra home
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Conta o clique (best-effort: se falhar, não atrapalha o redirecionamento)
  try {
    await supabaseAdmin
      .from("produtos")
      .update({ cliques: (produto.cliques || 0) + 1 })
      .eq("id", id);
  } catch (e) {
    // ignora
  }

  return NextResponse.redirect(produto.link_afiliado);
}
