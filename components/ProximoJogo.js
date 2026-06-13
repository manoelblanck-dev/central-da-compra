import Countdown from "@/components/Countdown";

// Recebe o objeto `jogo` salvo no painel:
//   { adversario, data: "YYYY-MM-DDTHH:MM", local, mando }
// Interpreta a data no fuso do Brasil (-03:00).
// Esconde sozinho se não houver jogo ou se ele já passou (com folga de 3h).
export default function ProximoJogo({ jogo }) {
  if (!jogo || !jogo.adversario || !jogo.data) return null;

  const alvo = new Date(`${jogo.data}-03:00`).getTime();
  if (isNaN(alvo)) return null;
  if (alvo < Date.now() - 3 * 3600000) return null;

  const dataFmt = new Date(alvo).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const mando = jogo.mando === "fora" ? "fora" : "casa";
  const confronto =
    mando === "fora"
      ? `${jogo.adversario} 🆚 🇧🇷 Brasil`
      : `🇧🇷 Brasil 🆚 ${jogo.adversario}`;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-br-green/40 bg-[#F0FAF3]">
      <div className="flex flex-col items-center gap-1 px-4 py-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-br-green">
            ⚽ Próximo jogo do Brasil
          </p>
          <p className="cc-mono text-lg text-cc-ink">{confronto}</p>
          <p className="text-xs capitalize text-cc-muted">
            {dataFmt}
            {jogo.local ? ` · ${jogo.local}` : ""}
          </p>
        </div>
        <div className="shrink-0 bg-br-green px-3 py-2 text-sm text-white">
          <Countdown alvo={alvo} />
        </div>
      </div>
    </div>
  );
}
