import Link from "next/link";
import { CATEGORIAS } from "@/lib/constantes";

function BandeiraBrasil() {
  return (
    <svg viewBox="0 0 28 20" width="30" height="22" aria-label="Bandeira do Brasil">
      <rect width="28" height="20" fill="#009739" />
      <polygon points="14,2.5 25.5,10 14,17.5 2.5,10" fill="#FEDD00" />
      <circle cx="14" cy="10" r="4.1" fill="#002776" />
    </svg>
  );
}

export default function CategoryCards() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {CATEGORIAS.map((c) => {
        const especialCopa = !!c.copa;
        const especialVideo = !!c.video;
        return (
          <Link
            key={c.slug}
            href={`/categoria/${c.slug}`}
            className={`flex flex-col items-center gap-2 border px-2 py-4 transition hover:-translate-y-0.5 ${
              especialCopa
                ? "border-br-green bg-[#F0FAF3]"
                : especialVideo
                ? "border-[#7A3FF2] bg-[#F4F0FF]"
                : "border-cc-line bg-white hover:border-cc-yellow"
            }`}
          >
            <span
              className={`grid h-12 w-12 place-items-center text-2xl ${
                especialCopa
                  ? "bg-[#DBF3E3]"
                  : especialVideo
                  ? "bg-[#E7DDFD]"
                  : "bg-cc-cream"
              }`}
            >
              {especialCopa ? <BandeiraBrasil /> : c.emoji}
            </span>
            <span
              className={`text-center text-[13px] font-medium leading-tight ${
                especialCopa
                  ? "text-br-green font-semibold"
                  : especialVideo
                  ? "text-[#5B27C4] font-semibold"
                  : "text-cc-ink"
              }`}
            >
              {c.nome}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
