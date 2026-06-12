export const metadata = {
  title: "Termos de Uso — Central da Compra",
};

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="cc-mono text-3xl text-cc-ink">Termos de Uso</h1>
      <p className="mt-2 text-sm text-cc-muted">Última atualização: junho de 2026</p>

      <div className="mt-8 space-y-5 leading-relaxed text-cc-ink">
        <p>
          Ao usar a Central da Compra, você concorda com os termos abaixo. Leia com atenção.
        </p>

        <h2 className="cc-mono text-xl">O que é a Central da Compra</h2>
        <p>
          Somos um site de divulgação de ofertas: reunimos e indicamos produtos vendidos por
          lojas parceiras (como Shopee e Mercado Livre). Não vendemos produtos diretamente,
          não processamos pagamentos e não realizamos entregas. Ao clicar em um produto, você
          é direcionado para a loja parceira, onde a compra é concluída.
        </p>

        <h2 className="cc-mono text-xl">Divulgação de afiliados</h2>
        <p>
          Alguns links do site são de afiliados. Isso significa que podemos receber uma
          comissão quando você compra por meio deles, <strong>sem nenhum custo extra para
          você</strong>. Essa é a forma como mantemos o site funcionando.
        </p>

        <h2 className="cc-mono text-xl">Preços e disponibilidade</h2>
        <p>
          Os preços e a disponibilidade exibidos são uma referência e podem mudar a qualquer
          momento na loja parceira. O valor e as condições válidos são sempre os apresentados
          na página da loja no momento da compra. Não nos responsabilizamos por divergências,
          erros de preço ou produtos esgotados.
        </p>

        <h2 className="cc-mono text-xl">Responsabilidade pela compra</h2>
        <p>
          A relação de compra, entrega, troca, garantia e atendimento é inteiramente entre
          você e a loja parceira. Qualquer questão sobre o pedido deve ser tratada
          diretamente com a plataforma onde a compra foi feita.
        </p>

        <h2 className="cc-mono text-xl">Uso do site</h2>
        <p>
          Você concorda em usar o site de forma lícita e a não tentar prejudicar seu
          funcionamento. O conteúdo e a identidade visual da Central da Compra não podem ser
          copiados sem autorização.
        </p>

        <h2 className="cc-mono text-xl">Alterações</h2>
        <p>
          Estes termos podem ser atualizados a qualquer momento. O uso contínuo do site após
          mudanças significa que você concorda com a versão vigente.
        </p>
      </div>

      <p className="mt-10 text-xs text-cc-muted">
        Este é um modelo inicial. Recomendamos revisar com um profissional e adaptar à
        realidade do seu negócio antes de considerá-lo definitivo.
      </p>
    </div>
  );
}
