import React from 'react';
import { Coffee, Database, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  isFiltered: boolean;
  onResetFilters: () => void;
  onOpenMigrationModal: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isFiltered,
  onResetFilters,
  onOpenMigrationModal,
}) => {
  if (isFiltered) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 mb-4">
          <Coffee className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-neutral-200">No matching items found</h3>
        <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
          No items match your active search keyword or category filter. Try clearing filters to see the full catalog.
        </p>
        <button
          onClick={onResetFilters}
          className="mt-5 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 border border-neutral-800 text-amber-400 hover:bg-neutral-800 transition cursor-pointer"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="py-16 px-6 text-center max-w-lg mx-auto bg-neutral-900/30 border border-neutral-800/80 rounded-3xl my-8">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
        <Database className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-neutral-100">Database Table is Empty</h3>
      <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
        The table <code className="px-1.5 py-0.5 rounded bg-neutral-800 text-amber-300 font-mono text-xs">public.products</code> is currently connected, but has no rows yet.
      </p>
      <div className="mt-4 p-3 bg-neutral-950/80 rounded-xl border border-neutral-800/80 text-xs text-neutral-400 text-left space-y-1.5">
        <div className="font-semibold text-neutral-300 flex items-center gap-1.5">
          <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
          How to populate items:
        </div>
        <p>1. Open your <strong>Supabase Dashboard → Table Editor</strong>.</p>
        <p>2. Insert a row in <code className="text-amber-300 font-mono text-[11px]">public.products</code> (or run the migration seed script).</p>
        <p>3. Watch this page update automatically in real-time without refreshing!</p>
      </div>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={onOpenMigrationModal}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-neutral-950 hover:bg-amber-400 transition cursor-pointer shadow-lg shadow-amber-500/20"
        >
          View SQL Migration & Seed Script
        </button>
      </div>
    </div>
  );
};
