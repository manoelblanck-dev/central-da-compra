// Card "fantasma" exibido enquanto os produtos carregam.
export default function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden border border-cc-line bg-white">
      <div className="aspect-square w-full animate-pulse bg-cc-line/60" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-3.5 w-full animate-pulse bg-cc-line/60" />
        <div className="h-3.5 w-2/3 animate-pulse bg-cc-line/60" />
        <div className="mt-2 h-6 w-1/2 animate-pulse bg-cc-line/60" />
      </div>
      <div className="p-3 pt-0">
        <div className="h-10 w-full animate-pulse bg-cc-line/60" />
      </div>
    </div>
  );
}
