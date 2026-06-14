import { revalidatePath } from "next/cache";

// Limpa o cache (ISR) das páginas públicas que mostram produtos.
// Chamado pelas rotas do painel sempre que algo muda (criar/editar/excluir
// produto, importar em lote, atualizar preços/imagens, cupons, próximo jogo),
// para que a mudança apareça quase na hora — mesmo com o cache ligado.
export function revalidarProdutos() {
  revalidatePath("/");
  revalidatePath("/produtos");
  revalidatePath("/ofertas");
  revalidatePath("/categoria/[slug]", "page"); // todas as categorias
  revalidatePath("/produto/[id]", "page"); // todas as páginas de produto
}
