export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 h-4 w-40 animate-pulse bg-cc-line/60" />
      <div className="grid gap-6 md:grid-cols-2 md:gap-10">
        <div className="aspect-square w-full animate-pulse bg-cc-line/60" />
        <div className="flex flex-col gap-4">
          <div className="h-5 w-24 animate-pulse bg-cc-line/60" />
          <div className="h-8 w-3/4 animate-pulse bg-cc-line/60" />
          <div className="h-10 w-1/2 animate-pulse bg-cc-line/60" />
          <div className="mt-2 h-14 w-full animate-pulse bg-cc-line/60" />
          <div className="h-24 w-full animate-pulse bg-cc-line/60" />
        </div>
      </div>
    </div>
  );
}
