import BuscaResultados from "@/components/BuscaResultados";

export const dynamic = "force-dynamic";

export default function BuscaPage({ searchParams }) {
  const q = (searchParams?.q || "").trim();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="cc-mono text-2xl text-cc-ink">
        {q ? <>Resultados para “{q}”</> : "Buscar produtos"}
      </h1>
      <p className="mb-6 mt-1 text-sm text-cc-muted">
        {q
          ? "Os resultados se atualizam conforme você digita na busca do topo."
          : "Digite na busca do topo para encontrar produtos."}
      </p>
      <BuscaResultados termo={q} />
    </div>
  );
}
