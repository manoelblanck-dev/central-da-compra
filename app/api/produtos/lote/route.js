import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { tokenSessao } from "@/lib/auth";
import { detectarPlataforma, normalizarPlataforma } from "@/lib/constantes";

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

  return NextResponse.json({ excluidos: validos.length });
}
