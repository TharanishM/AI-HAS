import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="glass-card p-6 rounded-2xl animate-pulse flex flex-col gap-4">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
      <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded-lg w-2/3"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2"></div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="w-full glass-panel rounded-2xl border p-4 animate-pulse">
      <div className="flex justify-between border-b pb-3 mb-3">
        <div className="h-5 bg-slate-300 dark:bg-slate-700 rounded-lg w-1/5"></div>
        <div className="h-5 bg-slate-300 dark:bg-slate-700 rounded-lg w-1/5"></div>
        <div className="h-5 bg-slate-300 dark:bg-slate-700 rounded-lg w-1/5"></div>
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ListSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          <div className="flex-grow flex flex-col gap-2">
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded-lg w-1/3"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2"></div>
          </div>
          <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        </div>
      ))}
    </div>
  );
};
