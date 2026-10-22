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
            <a
              href="https://github.com/dduskxy/Mitchell"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-neutral-200 transition"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>dduskxy/Mitchell</span>
            </a>
            <span className="text-neutral-750">·</span>
            <a
              href="https://jsajtnrvocialfaupjxw.supabase.co"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-neutral-200 transition"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supabase (jsajtnrvocialfaupjxw)</span>
            </a>
            <span className="text-neutral-750">·</span>
            <a
              href="https://dduskxy.github.io/Mitchell/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-neutral-200 transition"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>GitHub Pages</span>
            </a>
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
