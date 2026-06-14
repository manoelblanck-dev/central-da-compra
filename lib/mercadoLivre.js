// Funções auxiliares para descobrir o preço atual de um produto no
// Mercado Livre, a partir do link de afiliado cadastrado.

// Extrai o código do anúncio (ex: "MLB1234567890") de uma URL do Mercado Livre.
export function extrairIdML(url) {
  const match = (url || "").match(/MLB-?(\d{6,})/i);
  return match ? `MLB${match[1]}` : null;
}

// Links de afiliado (ex: mercadolivre.com/sec/XXXX) redirecionam para a
// página real do produto, que contém o código MLB no endereço.
export async function resolverIdML(link) {
  if (!link) return null;

  const direto = extrairIdML(link);
  if (direto) return direto;

  try {
    const resposta = await fetch(link, { redirect: "follow" });
    return extrairIdML(resposta.url);
  } catch {
    return null;
  }
}

// Consulta a API pública do Mercado Livre (sem necessidade de login)
// e devolve o preço atual do anúncio, ou null se não encontrar.
export async function buscarPrecoML(itemId) {
  try {
    const resposta = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
      cache: "no-store",
    });
    if (!resposta.ok) return null;

    const dados = await resposta.json();
    return typeof dados.price === "number" ? dados.price : null;
  } catch {
    return null;
  }
}
