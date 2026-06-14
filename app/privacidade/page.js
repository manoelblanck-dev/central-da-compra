export const metadata = {
  title: "Política de Privacidade — Central da Compra",
};

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="cc-mono text-3xl text-cc-ink">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-cc-muted">Última atualização: junho de 2026</p>

      <div className="mt-8 space-y-5 leading-relaxed text-cc-ink">
        <p>
          A Central da Compra respeita a sua privacidade. Esta página explica, de forma
          simples, como tratamos os dados de quem visita o site, em conformidade com a Lei
          Geral de Proteção de Dados (LGPD).
        </p>

        <h2 className="cc-mono text-xl">Quais dados coletamos</h2>
        <p>
          Não pedimos cadastro nem dados pessoais para você navegar ou comprar. Coletamos
          apenas dados de navegação anônimos e agregados (como páginas mais visitadas e
          número de visitantes), por meio de ferramentas de análise de tráfego, com o
          objetivo de melhorar o site.
        </p>

        <h2 className="cc-mono text-xl">Links de afiliados</h2>
        <p>
          A Central da Compra participa de programas de afiliados (como Shopee e Mercado
          Livre). Quando você clica em um produto e é direcionado para a loja parceira, ela
          pode registrar que a visita veio do nosso site, para fins de comissão. Esse
          processo é gerenciado pelas próprias plataformas, segundo as políticas de
          privacidade delas. A compra é sempre feita no site da loja parceira, não aqui.
        </p>

        <h2 className="cc-mono text-xl">Cookies e pixels de medição</h2>
        <p>
          Usamos cookies essenciais ao funcionamento do site e, mediante o seu
          consentimento, ferramentas de medição de audiência e anúncios — incluindo o{" "}
          <b>Pixel da Meta</b> (Facebook e Instagram) e o <b>Pixel do TikTok</b>. Eles
          ajudam a entender, de forma agregada, quais ofertas interessam aos visitantes e a
          exibir anúncios mais relevantes.
        </p>
        <p>
          Esses pixels só são ativados depois que você clica em <b>“Aceitar”</b> no aviso de
          cookies. Você pode recusar a qualquer momento e também desativar cookies nas
          configurações do seu navegador, embora isso possa afetar parte da experiência.
        </p>

        <h2 className="cc-mono text-xl">Seus direitos</h2>
        <p>
          Você pode solicitar informações sobre o tratamento dos seus dados a qualquer
          momento. Como não coletamos dados pessoais identificáveis, na maioria dos casos
          não há informações individuais armazenadas conosco.
        </p>

        <h2 className="cc-mono text-xl">Contato</h2>
        <p>
          Dúvidas sobre esta política podem ser enviadas pelo canal de contato informado no
          site.
        </p>
      </div>

      <p className="mt-10 text-xs text-cc-muted">
        Este é um modelo inicial. Recomendamos revisar com um profissional e adaptar à
        realidade do seu negócio antes de considerá-lo definitivo.
      </p>
    </div>
  );
}
