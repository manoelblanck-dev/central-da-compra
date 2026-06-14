import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { tokenSessao } from "@/lib/auth";

async function autorizado(request) {
  const cookie = request.cookies.get("cc_admin")?.value;
  if (!cookie || !process.env.ADMIN_PASSWORD) return false;
  return cookie === (await tokenSessao());
}

export async function POST(request) {
  if (!(await autorizado(request))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  let file;
  try {
    const formData = await request.formData();
    file = formData.get("file");
  } catch {
    return NextResponse.json({ erro: "Envio inválido." }, { status: 400 });
  }

  if (!file || typeof file === "string") {
    return NextResponse.json({ erro: "Nenhum arquivo enviado." }, { status: 400 });
  }

  // Segurança: aceitar apenas imagens, e limitar o tamanho (8 MB).
  const tipo = file.type || "";
  if (!tipo.startsWith("image/")) {
    return NextResponse.json(
      { erro: "Só é permitido enviar imagens." },
      { status: 400 }
    );
  }
  if (file.size && file.size > 8 * 1024 * 1024) {
    return NextResponse.json(
      { erro: "Imagem muito grande (máximo 8 MB)." },
      { status: 400 }
    );
  }

  // Gera um nome único pro arquivo. A extensão só pode ser uma destas
  // (evita que um nome de arquivo malicioso crie subpastas no bucket).
  const EXTENSOES_PERMITIDAS = ["jpg", "jpeg", "png", "webp", "gif"];
  const extEnviada = (file.name?.split(".").pop() || "").toLowerCase();
  const ext = EXTENSOES_PERMITIDAS.includes(extEnviada) ? extEnviada : "jpg";
  const nome = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from("produtos") // nome do bucket criado no Supabase
    .upload(nome, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 400 });
  }

  const { data } = supabaseAdmin.storage.from("produtos").getPublicUrl(nome);
  return NextResponse.json({ url: data.publicUrl });
}
