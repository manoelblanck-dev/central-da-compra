export default function AbaBotao({ ativo, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
        ativo
          ? "border-cc-yellow text-cc-ink"
          : "border-transparent text-cc-muted hover:text-cc-ink"
      }`}
    >
      {children}
    </button>
  );
}

