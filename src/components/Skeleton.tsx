export function SkeletonCard() {
  return (
    <div className="bg-slate-800 rounded-2xl p-5 animate-pulse">
      <div className="h-4 bg-slate-700 rounded w-1/3 mb-3" />
      <div className="h-8 bg-slate-700 rounded w-1/2 mb-2" />
      <div className="h-3 bg-slate-700 rounded w-2/3" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="bg-slate-800 rounded-xl p-4 animate-pulse flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-700 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-2" />
        <div className="h-3 bg-slate-700 rounded w-1/2" />
      </div>
      <div className="w-12 h-12 bg-slate-700 rounded-full" />
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="space-y-4 p-6 animate-pulse">
      <div className="h-8 bg-slate-700 rounded w-1/4 mb-6" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="space-y-3 mt-6">
        {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
      </div>
    </div>
  );
}
