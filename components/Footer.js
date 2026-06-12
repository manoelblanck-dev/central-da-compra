import Link from "next/link";
import { CATEGORIAS } from "@/lib/constantes";

export default function Footer() {
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
              para você comprar com tranquilidade.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-cc-ink">Categorias</p>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm text-cc-muted">
              {CATEGORIAS.map((c) => (
                <li key={c.slug}>
                  <Link href={`/categoria/${c.slug}`} className="hover:text-cc-ink">
                    {c.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-cc-line pt-5 text-xs text-cc-muted">
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
