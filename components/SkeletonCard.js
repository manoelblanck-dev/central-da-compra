// Card "fantasma" exibido enquanto os produtos carregam.
export default function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-cc-line bg-white">
      <div className="aspect-square w-full animate-pulse bg-cc-cream2" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-3.5 w-full animate-pulse rounded bg-cc-cream2" />
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-cc-cream2" />
        <div className="mt-2 h-6 w-1/2 animate-pulse rounded bg-cc-cream2" />
      </div>
      <div className="p-4 pt-0">
        <div className="h-11 w-full animate-pulse rounded-xl bg-cc-cream2" />
      </div>
    </div>
  );
}
