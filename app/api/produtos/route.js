import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { tokenSessao } from "@/lib/auth";
import { revalidarProdutos } from "@/lib/revalidar";

async function autorizado(request) {
  const cookie = request.cookies.get("cc_admin")?.value;
  if (!cookie || !process.env.ADMIN_PASSWORD) return false;
  return cookie === (await tokenSessao());
}

// Limpa o corpo recebido, mantendo só os campos válidos.
// Valida o link de afiliado: precisa ser uma URL https:// válida.
function linkValido(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

// Limpa a lista de fotos extras (galeria): só URLs válidas, no máximo 10.
function limparImagens(v) {
  if (!Array.isArray(v)) return [];
  return v
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter((u) => u && (u.startsWith("http") || u.startsWith("/")))
    .slice(0, 10);
}

// Limpa a lista de subcategorias (atalhos/slugs): sem vazios nem repetidos, máx 20.
function limparSubs(v) {
  if (!Array.isArray(v)) return [];
  return [...new Set(v.map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean))].slice(
    0,
    20
  );
}

function montarProduto(body) {
  const numero = (v) => (v === "" || v === null || v === undefined ? null : Number(v));
  // nota limitada a 0–5; avaliações nunca negativas
  let nota = numero(body.nota);
  if (nota !== null) nota = Math.max(0, Math.min(5, nota));
  let avaliacoes = numero(body.avaliacoes);
  if (avaliacoes !== null) avaliacoes = Math.max(0, Math.round(avaliacoes));
  // comissão de afiliado em %, limitada a 0–100
  let comissao = numero(body.comissao_percent);
  if (comissao !== null) comissao = Math.max(0, Math.min(100, comissao));
  const subcategorias = limparSubs(body.subcategorias);
  return {
    nome: body.nome?.trim() || "",
    descricao: body.descricao?.trim() || null,
    preco: numero(body.preco),
    preco_antigo: numero(body.preco_antigo),
    imagem_url: body.imagem_url?.trim() || null,
    link_afiliado: body.link_afiliado?.trim() || "",
    plataforma: body.plataforma || "shopee",
    categoria: body.categoria || "outros",
    subcategoria: subcategorias[0] || null,
    subcategorias,
    destaque: !!body.destaque,
    nota,
    avaliacoes,
    comissao_percent: comissao,
    imagens: limparImagens(body.imagens),
  };
}

export async function POST(request) {
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
    .insert(produto)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 400 });
  }
  revalidarProdutos();
  return NextResponse.json(data);
}
