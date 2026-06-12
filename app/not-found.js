import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="cc-mono text-6xl text-cc-yellow">CC</span>
      <h1 className="mt-4 cc-mono text-2xl text-cc-ink">Página não encontrada</h1>
      <p className="mt-2 text-sm text-cc-muted">
        O produto ou página que você procura não existe mais.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-cc-yellow px-6 py-2.5 text-sm font-bold text-cc-ink transition hover:bg-cc-yellow-dark"
      >
        Voltar para a home
      </Link>
    </div>
  );
}
