import Link from "next/link";
import BotaoWhatsApp from "@/components/BotaoWhatsApp";
import { IconEscudo, IconLojaOficial, IconRapido } from "@/components/IconesSelo";

export const metadata = {
  title: "Sobre a Central da Compra — quem somos e como funciona",
  description:
    "Conheça a Central da Compra: garimpamos as melhores ofertas da Shopee, Mercado Livre e TikTok Shop pra você comprar com segurança, direto na loja oficial.",
};

// Para trocar o e-mail de contato, basta mudar esta linha.
const EMAIL = "manoelblanck@gmail.com";

const PASSOS = [
  {
    n: "1",
    t: "Garimpamos",
    d: "Selecionamos boas ofertas da Shopee, Mercado Livre e TikTok Shop todos os dias.",
  },
  {
    n: "2",
    t: "Você escolhe",
    d: "Compara preço, nota e avaliações aqui, sem precisar de cadastro.",
  },
  {
    n: "3",
    t: "Compra na loja oficial",
    d: "Te levamos para a loja finalizar a compra com toda a segurança dela.",
  },
];

const MOTIVOS = [
  {
    I: IconLojaOficial,
    t: "Compra direto na loja oficial",
    d: "O pagamento e a entrega são feitos pela Shopee, Mercado Livre ou TikTok Shop — nunca por nós.",
  },
  {
    I: IconEscudo,
    t: "Sem cadastro, sem pegadinha",
    d: "Você navega à vontade; não pedimos seus dados para ver as ofertas.",
  },
  {
    I: IconRapido,
    t: "Sem custo extra para você",
    d: "Alguns links são de afiliado: podemos receber uma pequena comissão da loja, e o preço para você continua o mesmo.",
  },
];

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* hero */}
      <section className="rounded-3xl border border-cc-line bg-[linear-gradient(135deg,#FFF6E6_0%,#FAF6EF_55%,#F3EEE5_100%)] px-6 py-10 sm:px-10">
        <h1 className="text-3xl font-semibold tracking-tight text-cc-ink sm:text-4xl">
          Sobre a <span className="serif-accent">Central da Compra</span>
        </h1>
        <p className="mt-3 max-w-[52ch] text-sm text-cc-muted sm:text-base">
          A gente garimpa as melhores promoções da Shopee, Mercado Livre e TikTok Shop e reúne
          tudo num lugar só — para você economizar tempo e comprar com segurança.
        </p>
      </section>

      {/* quem somos */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-cc-ink">Quem somos</h2>
        <p className="mt-2 text-sm leading-relaxed text-cc-muted">
          A Central da Compra é um site brasileiro de curadoria de ofertas. Todos os dias
          procuramos produtos bons, com preço justo e boa reputação nas lojas, e deixamos tudo
          organizado por categoria para facilitar a sua busca. Não vendemos nada diretamente:
          quando você encontra algo que gosta, te levamos para a loja oficial concluir a compra
          com toda a segurança dela.
        </p>
      </section>

      {/* como funciona */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-cc-ink">Como funciona</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {PASSOS.map((p) => (
            <div key={p.n} className="rounded-2xl border border-cc-line bg-white p-4 shadow-card">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-cc-yellow text-sm font-bold text-cc-ink">
                {p.n}
              </span>
              <p className="mt-2 font-semibold text-cc-ink">{p.t}</p>
              <p className="mt-1 text-sm text-cc-muted">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* por que confiar */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-cc-ink">Por que confiar</h2>
        <div className="mt-3 space-y-2.5">
          {MOTIVOS.map((b, i) => (
            <div key={i} className="flex gap-3 rounded-2xl border border-cc-line bg-white p-4 shadow-card">
              <b.I className="mt-0.5 h-5 w-5 shrink-0 text-br-green" />
              <div>
                <p className="font-semibold text-cc-ink">{b.t}</p>
                <p className="mt-0.5 text-sm text-cc-muted">{b.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* contato */}
      <section className="mt-8 rounded-3xl border border-cc-line bg-cc-cream/50 px-6 py-8 sm:px-8">
        <h2 className="text-xl font-semibold text-cc-ink">Fale com a gente</h2>
        <p className="mt-2 text-sm text-cc-muted">
          Dúvida, sugestão de produto ou parceria? Mande um e-mail que a gente responde. E, para
          não perder oferta, entre no nosso canal do WhatsApp. 🙂
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cc-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
          >
            ✉️ {EMAIL}
          </a>
          <BotaoWhatsApp variante="botao" />
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-cc-muted">
        <Link href="/privacidade" className="hover:text-cc-ink">
          Política de Privacidade
        </Link>
        {" · "}
        <Link href="/termos" className="hover:text-cc-ink">
          Termos de Uso
        </Link>
      </p>
    </div>
  );
}
