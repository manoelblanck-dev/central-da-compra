import { NextResponse } from "next/server";
import { tokenSessao } from "@/lib/auth";
import { resolverIdML, buscarDadosML } from "@/lib/mercadoLivre";

async function autorizado(request) {
  const cookie = request.cookies.get("cc_admin")?.value;
  if (!cookie || !process.env.ADMIN_PASSWORD) return false;
  return cookie === (await tokenSessao());
}

// Recebe um link de afiliado do Mercado Livre e devolve nome, preço e
// imagem do anúncio, para preencher o formulário de produto automaticamente.
export async function POST(request) {
  if (!(await autorizado(request))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  let link;
  try {
    const body = await request.json();
    link = (body?.link || "").toString().trim();
  } catch {
    return NextResponse.json({ erro: "Envio inválido." }, { status: 400 });
  }

  if (!link) {
    return NextResponse.json({ erro: "Informe o link do produto." }, { status: 400 });
  }

  const itemId = await resolverIdML(link);
  if (!itemId) {
    return NextResponse.json(
      { erro: "Não consegui identificar o anúncio do Mercado Livre nesse link." },
      { status: 400 }
    );
  }

  const dados = await buscarDadosML(itemId);
  if (!dados) {
    return NextResponse.json(
      { erro: "Não consegui buscar os dados desse anúncio." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ...dados, ml_item_id: itemId });
}
