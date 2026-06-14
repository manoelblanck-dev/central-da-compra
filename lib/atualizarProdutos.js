import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolverIdML, buscarAtualizacaoML } from "@/lib/mercadoLivre";

// Atualiza preço, nota e quantidade de avaliações de todos os produtos do
// Mercado Livre, consultando a API pública da plataforma.
// Usado tanto pelo job automático (cron) quanto pelo botão "Atualizar tudo"
// no painel admin.
export async function atualizarProdutosML() {
  const { data: produtos, error } = await supabaseAdmin
    .from("produtos")
    .select("id, preco, nota, avaliacoes, link_afiliado, ml_item_id")
    .eq("plataforma", "mercado_livre");

  if (error) throw new Error(error.message);

  const resultados = [];

  for (const produto of produtos || []) {
    try {
      const itemId = produto.ml_item_id || (await resolverIdML(produto.link_afiliado));
      if (!itemId) {
        resultados.push({ id: produto.id, status: "sem-id" });
        continue;
      }

      const dados = await buscarAtualizacaoML(itemId);

      const atualizacao = {};
      if (itemId !== produto.ml_item_id) atualizacao.ml_item_id = itemId;

      const precoAnterior = produto.preco === null ? null : Number(produto.preco);
      if (dados.preco !== null && dados.preco !== precoAnterior) {
        atualizacao.preco = dados.preco;
        // Só mostra "preço antigo" (tachado) quando o preço cai.
        // Se subiu, o desconto antigo deixou de fazer sentido.
        atualizacao.preco_antigo = dados.preco < precoAnterior ? precoAnterior : null;
      }

      if (dados.nota !== null && Number(dados.nota) !== Number(produto.nota)) {
        atualizacao.nota = dados.nota;
      }
      if (dados.avaliacoes !== null && Number(dados.avaliacoes) !== Number(produto.avaliacoes)) {
        atualizacao.avaliacoes = dados.avaliacoes;
      }

      if (Object.keys(atualizacao).length > 0) {
        await supabaseAdmin.from("produtos").update(atualizacao).eq("id", produto.id);
      }

      resultados.push({ id: produto.id, status: "ok", ...dados });
    } catch (e) {
      resultados.push({ id: produto.id, status: "erro", erro: String(e?.message || e) });
    }
  }

  return resultados;
}
