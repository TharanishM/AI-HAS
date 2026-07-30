
export const CardSkeleton = () => {
  return (
    <div className="glass-panel flex animate-pulse flex-col gap-4 rounded-2xl p-6" aria-hidden="true">
      <div className="h-4 w-1/3 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="h-8 w-2/3 rounded-lg bg-slate-300 dark:bg-slate-700" />
      <div className="h-4 w-1/2 rounded-lg bg-slate-200 dark:bg-slate-800" />
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="glass-panel w-full animate-pulse rounded-2xl border p-4" aria-hidden="true">
      <div className="mb-3 flex justify-between border-b pb-3">
        <div className="h-5 w-1/5 rounded-lg bg-slate-300 dark:bg-slate-700" />
        <div className="h-5 w-1/5 rounded-lg bg-slate-300 dark:bg-slate-700" />
        <div className="h-5 w-1/5 rounded-lg bg-slate-300 dark:bg-slate-700" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="h-4 w-1/4 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-1/4 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-1/4 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ListSkeleton = () => {
  return (
    <div className="flex animate-pulse flex-col gap-4" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="glass-panel flex items-center gap-4 rounded-xl p-4">
          <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="flex flex-grow flex-col gap-2">
            <div className="h-4 w-1/3 rounded-lg bg-slate-300 dark:bg-slate-700" />
            <div className="h-3 w-1/2 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-8 w-16 rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
};
