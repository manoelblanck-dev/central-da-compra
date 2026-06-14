import { CATEGORIAS } from "@/lib/constantes";
import { IconEscudo, IconLojaOficial, IconRapido } from "@/components/IconesSelo";

// Faixa de confiança com números reais que não dependem de tráfego —
// fica boa desde o primeiro dia e reforça credibilidade pra quem chega
// pela primeira vez (importante pro tráfego pago).
export default function FaixaConfianca({ totalProdutos = 0 }) {
  const itens = [
    {
      destaque: totalProdutos > 0 ? `${totalProdutos}` : "Ofertas",
      label: totalProdutos > 0 ? "ofertas garimpadas a dedo" : "garimpadas a dedo",
      Icone: IconLojaOficial,
    },
    { destaque: `${CATEGORIAS.length}`, label: "categorias pra explorar", Icone: IconFiltroFallback },
    { destaque: "3", label: "lojas oficiais (Shopee, ML, TikTok)", Icone: IconEscudo },
    { destaque: "Toda", label: "semana com novas ofertas", Icone: IconRapido },
  ];

  return (
    <section className="mt-12">
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-cc-line bg-cc-cream/40 p-4 sm:grid-cols-4 sm:gap-4 sm:p-6">
        {itens.map(({ destaque, label, Icone }, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-br-green shadow-card">
              <Icone className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="cc-mono text-lg leading-none text-cc-ink">{destaque}</p>
              <p className="mt-1 text-xs leading-tight text-cc-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Ícone simples de "categorias" (grade), pra não depender de import extra.
function IconFiltroFallback({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
