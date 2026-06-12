import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function autorizado(request) {
  const cookie = request.cookies.get("cc_admin")?.value;
  return !!process.env.ADMIN_PASSWORD && cookie === process.env.ADMIN_PASSWORD;
}

export async function POST(request) {
  if (!autorizado(request)) {
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

  const ext = (file.name?.split(".").pop() || "jpg").toLowerCase();
  const nome = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from("produtos")
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
