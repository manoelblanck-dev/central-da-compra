import { NextResponse } from "next/server";
import { tokenSessao } from "@/lib/auth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // A tela de login é livre; o resto de /admin exige cookie válido.
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const cookie = request.cookies.get("cc_admin")?.value;
    const valido = cookie && cookie === (await tokenSessao());
    if (!valido) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
