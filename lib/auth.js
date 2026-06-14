// Gera um "token de sessão" a partir da senha de admin, usando hash SHA-256.
// Assim o cookie guarda o HASH (irreversível), nunca a senha em texto puro.
// Funciona tanto no middleware (Edge) quanto nas rotas /api (Node).
export async function tokenSessao() {
  const base = (process.env.ADMIN_PASSWORD || "") + "|central-da-compra";
  const data = new TextEncoder().encode(base);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Hash SHA-256 de um texto qualquer (hex). Usado para comparar usuário/senha
// de forma que o tempo de resposta não dependa do tamanho do texto digitado
// (evita ataques de timing no login).
export async function hashTexto(texto) {
  const data = new TextEncoder().encode(texto || "");
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
