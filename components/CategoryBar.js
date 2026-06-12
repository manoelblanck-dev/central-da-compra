import Link from "next/link";
import { CATEGORIAS } from "@/lib/constantes";

export default function CategoryBar() {
  return (
    <nav className="border-t border-cc-line bg-white" aria-label="Categorias">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 py-2 text-sm">
        {CATEGORIAS.map((c) => (
          <Link
            key={c.slug}
            href={`/categoria/${c.slug}`}
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-cc-muted transition hover:bg-cc-cream hover:text-cc-ink"
          >
            <span aria-hidden>{c.emoji}</span>
            {c.nome}
          </Link>
        ))}
      </div>
    </nav>
  );
}
