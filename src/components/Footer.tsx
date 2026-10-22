import React from 'react';
import { Coffee, Database, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-neutral-900 bg-neutral-950 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-neutral-200">Mitchell Catalog</div>
              <div className="text-[11px] text-neutral-500">Autonomous Realtime Web Application</div>
            </div>
          </div>

          {/* Links & Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span>Mitchell Cafe & Kitchen</span>
            </span>
            <span className="text-neutral-750">·</span>
            <span className="flex items-center gap-1.5 text-neutral-400">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supabase Realtime</span>
            </span>
            <span className="text-neutral-750">·</span>
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Globe className="w-3.5 h-3.5" />
              <span>Live Catalog</span>
            </span>
          </div>

          {/* Copyright & Live Note */}
          <div className="text-[11px] text-neutral-500 text-center md:text-right">
            Engineered with React 19, TypeScript, Vite & Supabase Realtime
          </div>
        </div>
      </div>
    </footer>
  );
};
