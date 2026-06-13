// Mostra a nota em estrelas (0 a 5) com preenchimento proporcional.
// Componente puramente visual (sem interação).
export default function Estrelas({ nota, avaliacoes }) {
  if (nota === null || nota === undefined || nota === "") return null;
  const n = Math.max(0, Math.min(5, Number(nota)));
  if (isNaN(n)) return null;
  const pct = (n / 5) * 100;

  return (
    <span className="inline-flex items-center gap-1 text-xs text-cc-muted">
      <span className="relative inline-block whitespace-nowrap leading-none" aria-label={`Nota ${n} de 5`}>
        <span className="text-cc-line">★★★★★</span>
        <span
          className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-[#F5A623]"
          style={{ width: `${pct}%` }}
        >
          ★★★★★
        </span>
      </span>
      <span className="font-semibold text-cc-ink">{n.toFixed(1).replace(".", ",")}</span>
      {avaliacoes ? <span>({avaliacoes})</span> : null}
    </span>
  );
}
