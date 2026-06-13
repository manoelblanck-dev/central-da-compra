import { dadosPlataforma } from "@/lib/constantes";

export default function PlatformBadge({ plataforma, className = "" }) {
  const p = dadosPlataforma(plataforma);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold ${className}`}
      style={{
        backgroundColor: p.cor,
        color: p.textoClaro ? "#ffffff" : "#211c15",
      }}
    >
      {p.nome}
    </span>
  );
}
