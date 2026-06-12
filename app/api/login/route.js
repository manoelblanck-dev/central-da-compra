import { NextResponse } from "next/server";
import { tokenSessao } from "@/lib/auth";

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

export async function POST(request) {
  let usuario = "";
  let senha = "";
  try {
    const body = await request.json();
    usuario = body?.usuario || "";
    senha = body?.senha || "";
  } catch {
    usuario = "";
    senha = "";
  }

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, erro: "ADMIN_PASSWORD não configurada no servidor." },
      { status: 500 }
    );
  }

  // Usuário esperado: vem de ADMIN_USER. Se não existir, o padrão é "admin".
  const usuarioEsperado = process.env.ADMIN_USER || "admin";

  if (usuario === usuarioEsperado && senha === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("cc_admin", await tokenSessao(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });
    return res;
  }

  // Atraso de 1s após erro: desencoraja tentativas automáticas (força bruta).
  await espera(1000);
  return NextResponse.json(
    { ok: false, erro: "Usuário ou senha incorretos." },
    { status: 401 }
  );
}
