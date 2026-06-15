import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { tokenSessao } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function autorizado(request) {
  const cookie = request.cookies.get("cc_admin")?.value;
  if (!cookie || !process.env.ADMIN_PASSWORD) return false;
  return cookie === (await tokenSessao());
}

// Data (YYYY-MM-DD) no fuso de Brasília, para agrupar os cliques por dia.
function diaBR(iso) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

export async function GET(request) {
  if (!(await autorizado(request))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const desde = new Date(Date.now() - 7 * 86400000).toISOString();

  const { data: rows, error } = await supabaseAdmin
    .from("cliques_log")
    .select("produto_id, criado_em")
    .gte("criado_em", desde)
    .order("criado_em", { ascending: false })
    .limit(10000);

  // Se a tabela ainda não existe (migração não rodada), devolve vazio sem quebrar.
  if (error) {
    return NextResponse.json({
      porDia: [],
      top: [],
      totalSemana: 0,
      totalHoje: 0,
      semTabela: true,
    });
  }

  const logs = rows || [];

  // Esqueleto dos últimos 7 dias (inclui dias com 0 cliques).
  const skeleton = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    skeleton.push(d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" }));
  }

  const porDiaMap = {};
  const porProduto = {};
  for (const l of logs) {
    const dia = diaBR(l.criado_em);
    porDiaMap[dia] = (porDiaMap[dia] || 0) + 1;
    porProduto[l.produto_id] = (porProduto[l.produto_id] || 0) + 1;
  }

  const porDia = skeleton.map((dia) => ({ dia, total: porDiaMap[dia] || 0 }));

  // Top produtos da semana (busca os nomes).
  const topIds = Object.entries(porProduto)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  let nomes = {};
  if (topIds.length > 0) {
    const { data: prods } = await supabaseAdmin
      .from("produtos")
      .select("id, nome")
      .in("id", topIds.map(([id]) => id));
    for (const p of prods || []) nomes[p.id] = p.nome;
  }
  const top = topIds.map(([id, total]) => ({
    produto_id: id,
    nome: nomes[id] || "(produto removido)",
    total,
  }));

  return NextResponse.json({
    porDia,
    top,
    totalSemana: logs.length,
    totalHoje: porDia[porDia.length - 1].total,
  });
}
