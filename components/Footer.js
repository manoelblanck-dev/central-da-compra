import Link from "next/link";
import { CATEGORIAS } from "@/lib/constantes";
import BotaoWhatsApp from "@/components/BotaoWhatsApp";
import { getCategoriasComProdutos } from "@/lib/categoriasDisponiveis";

export default async function Footer() {
  // Mostra no rodapé só as categorias que têm produtos (esconde as vazias).
  const disponiveis = await getCategoriasComProdutos();
  const categorias = CATEGORIAS.filter((c) => disponiveis.includes(c.slug));

  return (
    <footer className="mt-16 border-t border-cc-line bg-cc-cream/60">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Central da Compra"
                className="h-9 w-9 rounded-lg object-cover"
              />
              <span className="cc-mono text-lg">Central da Compra</span>
            </div>
            <p className="mt-3 text-sm text-cc-muted">
              Selecionamos as melhores ofertas da Shopee, Mercado Livre e TikTok Shop
              para você comprar com tranquilidade. ⚽ Vai, Brasil!
            </p>
            {/* Convite pro WhatsApp (só aparece com o link configurado) */}
            <BotaoWhatsApp variante="botao" className="mt-4" />
          </div>

          {categorias.length > 0 ? (
            <div>
              <p className="mb-3 text-sm font-semibold text-cc-ink">Categorias</p>
              <ul className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm text-cc-muted">
                {categorias.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/categoria/${c.slug}`} className="hover:text-cc-ink">
                      {c.nome}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-8 border-t border-cc-line pt-5 text-xs text-cc-muted">
          <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/ofertas" className="hover:text-cc-ink">Ofertas da Semana</Link>
            <Link href="/produtos" className="hover:text-cc-ink">Todos os produtos</Link>
            <Link href="/privacidade" className="hover:text-cc-ink">Política de Privacidade</Link>
            <Link href="/termos" className="hover:text-cc-ink">Termos de Uso</Link>
          </div>
          <p>
            © {new Date().getFullYear()} Central da Compra. Alguns links são de
            afiliados — ao comprar por eles você ajuda a manter o site, sem custo
            extra para você.
          </p>
        </div>
      </div>
    </footer>
  );
}
