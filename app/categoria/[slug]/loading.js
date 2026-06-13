import SkeletonGrid from "@/components/SkeletonGrid";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 h-8 w-56 max-w-full animate-pulse bg-cc-line/60" />
      <SkeletonGrid count={8} />
    </div>
  );
}
