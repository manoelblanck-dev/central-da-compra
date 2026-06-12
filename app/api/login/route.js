import { NextResponse } from "next/server";

export async function POST(request) {
  let senha = "";
  try {
    const body = await request.json();
    senha = body?.senha || "";
  } catch {
    senha = "";
  }

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, erro: "ADMIN_PASSWORD não configurada no servidor." },
      { status: 500 }
    );
  }

  if (senha && senha === process.env.ADMIN_PASSWORD) {
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

  return NextResponse.json({ ok: false, erro: "Senha incorreta." }, { status: 401 });
}
