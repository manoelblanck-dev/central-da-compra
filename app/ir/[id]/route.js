import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// User-agents de robôs e prévias de link (WhatsApp, Telegram, buscadores...).
// Não contamos cliques desses — só de gente de verdade.
const ROBOS = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|discord|preview|embed|curl|wget|python|headless|lighthouse/i;

export async function GET(request, { params }) {
  const id = params.id;

  // Busca o link de afiliado do produto
  const { data: produto } = await supabase
    .from("produtos")
    .select("link_afiliado")
    .eq("id", id)
    .single();

  if (!produto || !produto.link_afiliado) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Conta o clique de forma ATÔMICA (sem perder cliques simultâneos),
  // ignorando robôs/prévias de link. Best-effort: não atrapalha o redirect.
  const ua = request.headers.get("user-agent") || "";
  if (!ROBOS.test(ua)) {
    try {
      // Em paralelo: incrementa o contador acumulado e registra o clique
      // com data (para o painel de desempenho). Best-effort, não trava o redirect.
      await Promise.allSettled([
        supabaseAdmin.rpc("increment_cliques", { produto_id: id }),
        supabaseAdmin.from("cliques_log").insert({ produto_id: id }),
      ]);
    } catch (e) {
      // ignora
    }
  }

  return NextResponse.redirect(produto.link_afiliado);
}
