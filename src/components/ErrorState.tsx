import React from 'react';
import { AlertTriangle, RefreshCw, Terminal } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  onOpenMigrationModal: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  onOpenMigrationModal,
}) => {
  const isTableMissing =
    message.includes('does not exist') || message.includes('schema cache') || message.includes('PGRST205');

  return (
    <div className="max-w-xl mx-auto my-12 p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-rose-500/30 backdrop-blur-md text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h3 className="text-xl font-bold text-neutral-100">Database Synchronization Notice</h3>

      <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800 text-left font-mono">
        {message}
      </p>

      {isTableMissing && (
        <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 text-left space-y-2">
          <p className="font-semibold text-amber-300 flex items-center gap-1.5">
            <Terminal className="w-4 h-4" />
            Quick Setup Required
          </p>
          <p>
            Your Supabase project is reachable, but the <code className="font-mono text-white">public.products</code> table has not been created yet.
          </p>
          <p>
            Open the SQL Editor in your Supabase dashboard and run the prepared migration script to create the table, enable RLS, configure Realtime publication, and add sample items.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 border border-neutral-850 text-neutral-200 hover:bg-neutral-800 transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>

        <button
          onClick={onOpenMigrationModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 text-neutral-950 hover:bg-amber-400 transition cursor-pointer shadow-lg shadow-amber-500/20"
        >
          <Terminal className="w-4 h-4" />
          <span>View SQL Migration Script</span>
        </button>
      </div>
    </div>
  );
};
