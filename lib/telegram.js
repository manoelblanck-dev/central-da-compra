// Envio de ofertas para o Telegram via Bot API.
// Usado pelo cron de disparos (app/api/cron/disparar-telegram) e pelo botão
// "Enviar agora" do painel (app/api/admin/disparo-teste).
//
// Precisa de duas variáveis de ambiente na Vercel:
//   TELEGRAM_BOT_TOKEN  -> token do bot (criado no @BotFather)
//   TELEGRAM_CHAT_ID    -> id do grupo/canal onde o bot posta

import { formatarPreco } from "@/lib/constantes";

const BASE = "https://centraldacompraonline.com.br";

// Escapa os caracteres que o Telegram interpreta como HTML, pra um nome de
// produto com "<", ">" ou "&" não quebrar a mensagem.
function escaparHtml(t) {
  return (t || "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Monta a legenda da oferta (Telegram aceita um HTML simples). Limite de 1024
// caracteres para legenda de foto.
function montarLegenda(produto) {
  const nome = escaparHtml(produto.nome);
  const preco = formatarPreco(produto.preco);
  const precoAntigo = formatarPreco(produto.preco_antigo);
  const temDesconto =
    produto.preco_antigo && Number(produto.preco_antigo) > Number(produto.preco);
  const desc = temDesconto
    ? Math.round((1 - Number(produto.preco) / Number(produto.preco_antigo)) * 100)
    : null;

  const linhas = ["🔥 <b>OFERTA</b>", "", `<b>${nome}</b>`, ""];
  if (preco) {
    let l = `💰 <b>${escaparHtml(preco)}</b>`;
    if (precoAntigo && temDesconto) l += `  <s>${escaparHtml(precoAntigo)}</s>`;
    linhas.push(l);
    if (desc) linhas.push(`🏷️ ${desc}% OFF`);
  } else {
    linhas.push("💰 Confira o preço na loja");
  }
  return linhas.join("\n").slice(0, 1024);
}

// Envia um produto pro Telegram. Retorna { ok, erro? }. Nunca lança exceção.
export async function enviarProdutoTelegram(produto, { token, chatId } = {}) {
  if (!token || !chatId) return { ok: false, erro: "Bot do Telegram não configurado." };
  if (!produto) return { ok: false, erro: "Produto inválido." };

  const url = `${BASE}/produto/${produto.id}`;
  const legenda = montarLegenda(produto);
  const teclado = { inline_keyboard: [[{ text: "🛒 Ver oferta", url }]] };

  // Com foto válida usa sendPhoto (mais bonito); senão, sendMessage com o link.
  const temFoto = produto.imagem_url && /^https?:\/\//.test(produto.imagem_url);
  const metodo = temFoto ? "sendPhoto" : "sendMessage";
  const corpo = temFoto
    ? {
        chat_id: chatId,
        photo: produto.imagem_url,
        caption: legenda,
        parse_mode: "HTML",
        reply_markup: teclado,
      }
    : {
        chat_id: chatId,
        text: `${legenda}\n\n${url}`,
        parse_mode: "HTML",
        reply_markup: teclado,
      };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${metodo}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      return { ok: false, erro: data.description || "Falha ao enviar pro Telegram." };
    }
    return { ok: true };
  } catch {
    return { ok: false, erro: "Erro de conexão com o Telegram." };
  }
}
