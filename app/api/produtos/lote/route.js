import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { tokenSessao } from "@/lib/auth";
import { detectarPlataforma, normalizarPlataforma } from "@/lib/constantes";
import { revalidarProdutos } from "@/lib/revalidar";

async function autorizado(request) {
  const cookie = request.cookies.get("cc_admin")?.value;
  if (!cookie || !process.env.ADMIN_PASSWORD) return false;
  return cookie === (await tokenSessao());
}

function linkValido(url) {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

const numero = (v) =>
  v === "" || v === null || v === undefined || isNaN(Number(v)) ? null : Number(v);

// nota limitada a 0–5; avaliações nunca negativas
function nota0a5(v) {
  const n = numero(v);
  return n === null ? null : Math.max(0, Math.min(5, n));
}
function avaliacoesValidas(v) {
  const n = numero(v);
  return n === null ? null : Math.max(0, Math.round(n));
}
// comissão de afiliado em %, limitada a 0–100
function comissaoValida(v) {
  const n = numero(v);
  return n === null ? null : Math.max(0, Math.min(100, n));
}
// fotos extras (galeria): só URLs válidas, no máximo 10
function limparImagens(v) {
  if (!Array.isArray(v)) return [];
  return v
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter((u) => u && (u.startsWith("http") || u.startsWith("/")))
    .slice(0, 10);
}

export async function POST(request) {
  if (!(await autorizado(request))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  let lista;
  try {
    const body = await request.json();
    lista = body?.produtos;
  } catch {
    return NextResponse.json({ erro: "Envio inválido." }, { status: 400 });
  }

  if (!Array.isArray(lista) || lista.length === 0) {
    return NextResponse.json({ erro: "Nenhum produto enviado." }, { status: 400 });
  }
  if (lista.length > 100) {
    return NextResponse.json(
      { erro: "Máximo de 100 produtos por vez." },
      { status: 400 }
    );
  }

  const validos = [];
  let ignorados = 0;
  for (const item of lista) {
    const nome = (item?.nome || "").toString().trim().slice(0, 200);
    const link = (item?.link_afiliado || "").toString().trim();
    if (!nome || !linkValido(link)) {
      ignorados++;
      continue;
    }
    validos.push({
      nome,
      descricao: item.descricao ? item.descricao.toString().slice(0, 2000) : null,
      preco: numero(item.preco),
      preco_antigo: numero(item.preco_antigo),
      imagem_url: item.imagem_url ? item.imagem_url.toString().trim() : null,
      link_afiliado: link,
      plataforma: normalizarPlataforma(item.plataforma) || detectarPlataforma(link) || "shopee",
      categoria: item.categoria || "outros",
      destaque: !!item.destaque,
      nota: nota0a5(item.nota),
      avaliacoes: avaliacoesValidas(item.avaliacoes),
      comissao_percent: comissaoValida(item.comissao_percent),
      imagens: limparImagens(item.imagens),
    });
  }

  if (validos.length === 0) {
    return NextResponse.json(
      { erro: "Nenhum produto válido. Cada linha precisa de nome e link https://" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin.from("produtos").insert(validos).select();
  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 400 });
  }

  revalidarProdutos();
  return NextResponse.json({ adicionados: data.length, ignorados });
}

// Formato de um UUID (v1 a v5), usado pra validar os ids recebidos.
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function DELETE(request) {
  if (!(await autorizado(request))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  let ids;
  try {
    const body = await request.json();
    ids = body?.ids;
  } catch {
    return NextResponse.json({ erro: "Envio inválido." }, { status: 400 });
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ erro: "Nenhum produto selecionado." }, { status: 400 });
  }

  const validos = [...new Set(ids)].filter((id) => typeof id === "string" && UUID_REGEX.test(id));
  if (validos.length === 0) {
    return NextResponse.json({ erro: "Nenhum produto válido selecionado." }, { status: 400 });
  }
  if (validos.length > 200) {
    return NextResponse.json({ erro: "Máximo de 200 produtos por vez." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("produtos").delete().in("id", validos);
  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 400 });
  }

  revalidarProdutos();
  return NextResponse.json({ excluidos: validos.length });
}
