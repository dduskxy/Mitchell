import React from 'react';
import { Sparkles, Zap, ShieldCheck } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 border-b border-neutral-900 bg-gradient-to-b from-neutral-900/30 to-transparent">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Realtime Synchronization</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Curated Roasts & <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
                Artisanal Cafe Catalog
              </span>
            </h1>

            <p className="mt-3 text-sm sm:text-base text-neutral-400 leading-relaxed max-w-xl">
              Experience dynamic catalog synchronization directly from our Supabase database. Any change in price, availability, or menu items is reflected live in your browser without requiring a page refresh.
            </p>
          </div>

          {/* Quick Metrics / Live Highlights */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Zero Refresh</span>
              </div>
              <div className="text-lg font-bold text-neutral-100">Postgres Changes</div>
              <p className="text-[11px] text-neutral-400 mt-0.5">WebSocket push &lt; 150ms</p>
            </div>

            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Security</span>
              </div>
              <div className="text-lg font-bold text-neutral-100">RLS Protected</div>
              <p className="text-[11px] text-neutral-400 mt-0.5">Public read, secured write</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
