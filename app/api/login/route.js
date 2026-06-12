import { NextResponse } from "next/server";

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

  // Usuário esperado: vem da variável ADMIN_USER. Se ela não estiver
  // configurada, o usuário padrão é "admin" (assim você nunca fica trancado).
  const usuarioEsperado = process.env.ADMIN_USER || "admin";

  if (usuario === usuarioEsperado && senha === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("cc_admin", process.env.ADMIN_PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });
    return res;
  }

  return NextResponse.json(
    { ok: false, erro: "Usuário ou senha incorretos." },
    { status: 401 }
  );
}
