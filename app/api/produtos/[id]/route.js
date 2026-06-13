import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { tokenSessao } from "@/lib/auth";

async function autorizado(request) {
  const cookie = request.cookies.get("cc_admin")?.value;
  if (!cookie || !process.env.ADMIN_PASSWORD) return false;
  return cookie === (await tokenSessao());
}

// Valida o link de afiliado: precisa ser uma URL https:// válida.
function linkValido(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

function montarProduto(body) {
  const numero = (v) => (v === "" || v === null || v === undefined ? null : Number(v));
  let nota = numero(body.nota);
  if (nota !== null) nota = Math.max(0, Math.min(5, nota));
  let avaliacoes = numero(body.avaliacoes);
  if (avaliacoes !== null) avaliacoes = Math.max(0, Math.round(avaliacoes));
  return {
    nome: body.nome?.trim() || "",
    descricao: body.descricao?.trim() || null,
    preco: numero(body.preco),
    preco_antigo: numero(body.preco_antigo),
    imagem_url: body.imagem_url?.trim() || null,
    link_afiliado: body.link_afiliado?.trim() || "",
    plataforma: body.plataforma || "shopee",
    categoria: body.categoria || "outros",
    destaque: !!body.destaque,
    nota,
    avaliacoes,
  };
}

export async function PUT(request, { params }) {
  if (!(await autorizado(request))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const produto = montarProduto(body);

  if (!produto.nome || !produto.link_afiliado) {
    return NextResponse.json(
      { erro: "Nome e link de afiliado são obrigatórios." },
      { status: 400 }
    );
  }

  if (!linkValido(produto.link_afiliado)) {
    return NextResponse.json(
      { erro: "O link de afiliado precisa ser uma URL válida começando com https://" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("produtos")
    .update(produto)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}

export async function DELETE(request, { params }) {
  if (!(await autorizado(request))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const { error } = await supabaseAdmin.from("produtos").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
