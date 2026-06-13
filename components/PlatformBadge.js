import { dadosPlataforma } from "@/lib/constantes";

// Selo da plataforma em estilo "vidro" branco (premium), com o nome da loja.
export default function PlatformBadge({ plataforma, className = "" }) {
  const p = dadosPlataforma(plataforma);
  return (
    <span
      className={`inline-flex items-center rounded-full border border-cc-line bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-cc-ink backdrop-blur ${className}`}
    >
      {p.nome}
    </span>
  );
}
