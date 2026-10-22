import React from 'react';
import { ConnectionBadge } from './ConnectionBadge';
import { ConnectionState } from '../types/product';
import { Activity, Database, Coffee } from 'lucide-react';

interface HeaderProps {
  status: ConnectionState;
  lastSyncTime: Date | null;
  activityCount: number;
  onRefresh: () => void;
  onToggleActivity: () => void;
  onOpenMigrationModal: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  lastSyncTime,
  activityCount,
  onRefresh,
  onToggleActivity,
  onOpenMigrationModal,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
              <Coffee className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                MITCHELL
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Live Menu
              </span>
            </div>
            <p className="text-xs text-neutral-400 hidden sm:block">
              Artisan Cafe & Espresso Bar · Autonomous Realtime
            </p>
          </div>
        </div>

        {/* Actions & Status */}
        <div className="flex items-center gap-3">
          {/* Connection Status Badge */}
          <ConnectionBadge
            status={status}
            lastSyncTime={lastSyncTime}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
          />

          {/* Activity Feed Toggle */}
          <button
            onClick={onToggleActivity}
            className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-900 border border-neutral-800 text-neutral-200 hover:border-amber-500/50 hover:text-amber-300 transition cursor-pointer"
            title="Open Live Database Activity Feed"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Activity</span>
            {activityCount > 0 && (
              <span className="flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-neutral-950 min-w-4 h-4">
                {activityCount}
              </span>
            )}
          </button>

          {/* Database & SQL Modal Button */}
          <button
            onClick={onOpenMigrationModal}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition cursor-pointer"
            title="View Supabase Schema & SQL Migration"
          >
            <Database className="w-3.5 h-3.5 text-neutral-400" />
            <span>SQL Schema</span>
          </button>
        </div>
      </div>
    </header>
  );
};
