// Textos das mensagens de oferta, compartilhados entre o disparo automático no
// Telegram (lib/telegram.js) e o botão "Copiar pro WhatsApp" do painel
// (components/admin/SecaoDisparos.js). Mantém a copy num lugar só.

import { formatarPreco } from "@/lib/constantes";

const BASE = "https://centraldacompraonline.com.br";

// Aberturas que chamam a atenção. Variam a cada mensagem pra não ficar robótico.
export const ABERTURAS = [
  "👀 Olha o que a gente acabou de achar!",
  "🚨 Achadinho do dia chegando!",
  "🔥 Oferta fresquinha, separada pra você!",
  "✨ Encontramos essa e já corremos avisar!",
  "🛒 Promoção boa não espera — olha essa!",
  "💥 Caiu o preço! Dá uma olhada 👇",
  "🤑 Essa tá boa demais pra deixar passar!",
  "🎯 Garimpamos e essa valeu muito a pena!",
  "⏰ Alerta de oferta — corre que voa!",
  "😍 Achado do dia que vale cada centavo!",
  "📦 Acabou de chegar e já é promoção!",
];

export function aberturaAleatoria() {
  return ABERTURAS[Math.floor(Math.random() * ABERTURAS.length)];
}

// Calcula preço/desconto/economia uma vez só (usado pelas duas mensagens).
export function dadosPreco(produto) {
  const preco = formatarPreco(produto.preco);
  const precoAntigo = formatarPreco(produto.preco_antigo);
  const temDesconto =
    produto.preco_antigo && Number(produto.preco_antigo) > Number(produto.preco);
  const desc = temDesconto
    ? Math.round((1 - Number(produto.preco) / Number(produto.preco_antigo)) * 100)
    : null;
  const economia = temDesconto
    ? formatarPreco(Number(produto.preco_antigo) - Number(produto.preco))
    : null;
  return { preco, precoAntigo, temDesconto, desc, economia };
}

// Mensagem em TEXTO PURO com a formatação do WhatsApp (*negrito*, ~tachado~).
// Usada no botão "Copiar pro WhatsApp" do painel — você cola no grupo/canal.
export function mensagemWhatsapp(produto) {
  if (!produto) return "";
  const { preco, precoAntigo, temDesconto, desc, economia } = dadosPreco(produto);
  const url = `${BASE}/produto/${produto.id}`;

  const linhas = [aberturaAleatoria(), "", `🛍️ *${produto.nome}*`, ""];
  if (preco) {
    let l = `💸 *${preco}*`;
    if (precoAntigo && temDesconto) l += `  ~${precoAntigo}~`;
    linhas.push(l);
    if (desc) {
      linhas.push(`🔥 ${desc}% OFF${economia ? ` — você economiza ${economia}` : ""}`);
    }
  } else {
    linhas.push("💸 Confira o preço na loja");
  }
  linhas.push("");
  linhas.push("⚡ Os preços mudam rápido — garanta o seu!");
  linhas.push(`👉 ${url}`);

  return linhas.join("\n");
}
