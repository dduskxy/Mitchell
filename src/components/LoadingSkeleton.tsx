import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-2xl bg-neutral-900/40 border border-neutral-800/60 overflow-hidden animate-pulse"
        >
          {/* Image skeleton */}
          <div className="aspect-[4/3] w-full bg-neutral-800/60" />

          {/* Text skeleton */}
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="h-4 bg-neutral-800 rounded w-2/3" />
              <div className="h-4 bg-neutral-800 rounded w-1/4" />
            </div>
            <div className="h-3 bg-neutral-800/60 rounded w-full" />
            <div className="h-3 bg-neutral-800/40 rounded w-4/5" />
            <div className="pt-3 border-t border-neutral-800/50 flex justify-between">
              <div className="h-3 bg-neutral-800/40 rounded w-1/3" />
              <div className="h-3 bg-neutral-800/40 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
