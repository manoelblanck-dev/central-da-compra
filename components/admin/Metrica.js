export default function Metrica({ rotulo, valor }) {
  return (
    <div className="border border-cc-line bg-white px-4 py-4">
      <p className="cc-mono text-3xl text-cc-ink">{valor}</p>
      <p className="text-xs text-cc-muted">{rotulo}</p>
    </div>
  );
}

