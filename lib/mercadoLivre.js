// Funções auxiliares para descobrir o preço atual de um produto no
// Mercado Livre, a partir do link de afiliado cadastrado.

// Extrai o código do anúncio (ex: "MLB1234567890") de uma URL do Mercado Livre.
export function extrairIdML(url) {
  const match = (url || "").match(/MLB-?(\d{6,})/i);
  return match ? `MLB${match[1]}` : null;
}

// Cabeçalho necessário porque o Mercado Livre bloqueia (403) requisições
// sem User-Agent de navegador.
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// Links de afiliado (ex: mercadolivre.com/sec/XXXX, meli.la/XXXX) redirecionam
// para a página real do produto. Às vezes o código MLB já vem no endereço
// final, e às vezes só aparece dentro do HTML da página (redirecionamento
// por "meta refresh").
export async function resolverIdML(link) {
  if (!link) return null;

  const direto = extrairIdML(link);
  if (direto) return direto;

  try {
    const resposta = await fetch(link, {
      redirect: "follow",
      headers: { "User-Agent": USER_AGENT },
    });

    const daUrl = extrairIdML(resposta.url);
    if (daUrl) return daUrl;

    const texto = await resposta.text();
    return extrairIdML(texto);
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

// Consulta a avaliação (nota média e total de avaliações) de um anúncio
// na API pública do Mercado Livre.
export async function buscarAvaliacoesML(itemId) {
  try {
    const resposta = await fetch(`https://api.mercadolibre.com/reviews/item/${itemId}`, {
      cache: "no-store",
    });
    if (!resposta.ok) return null;

    const dados = await resposta.json();
    return {
      nota: typeof dados.rating_average === "number" ? dados.rating_average : null,
      avaliacoes: typeof dados.total_reviews === "number" ? dados.total_reviews : null,
    };
  } catch {
    return null;
  }
}

// Busca preço e avaliação de um anúncio em paralelo — usado pela
// atualização automática de produtos.
export async function buscarAtualizacaoML(itemId) {
  const [preco, avaliacao] = await Promise.all([
    buscarPrecoML(itemId),
    buscarAvaliacoesML(itemId),
  ]);

  return {
    preco,
    nota: avaliacao?.nota ?? null,
    avaliacoes: avaliacao?.avaliacoes ?? null,
  };
}

// Busca nome, preço e imagem de um anúncio do Mercado Livre, para preencher
// o formulário de produto automaticamente a partir do link de afiliado.
export async function buscarDadosML(itemId) {
  try {
    const resposta = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
      cache: "no-store",
    });
    if (!resposta.ok) return null;

    const dados = await resposta.json();
    return {
      nome: typeof dados.title === "string" ? dados.title : null,
      preco: typeof dados.price === "number" ? dados.price : null,
      imagem_url: dados.pictures?.[0]?.url || dados.thumbnail || null,
    };
  } catch {
    return null;
  }
}
