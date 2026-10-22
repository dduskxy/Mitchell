import React from 'react';
import { ActivityEvent } from '../types/activity';
import { Activity, Plus, RefreshCw, Trash2, ShieldAlert, X, Radio } from 'lucide-react';

interface ActivityFeedProps {
  activities: ActivityEvent[];
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityFeedDrawer: React.FC<ActivityFeedProps> = ({
  activities,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const renderBadge = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'INSERT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
            <Plus className="w-3 h-3" /> INSERT
          </span>
        );
      case 'UPDATE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-400 border border-amber-800/60">
            <RefreshCw className="w-3 h-3" /> UPDATE
          </span>
        );
      case 'DELETE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-400 border border-rose-800/60">
            <Trash2 className="w-3 h-3" /> DELETE
          </span>
        );
      case 'SYSTEM':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
            <Radio className="w-3 h-3 text-sky-400" /> SYSTEM
          </span>
        );
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <aside
      role="complementary"
      aria-label="Live Database Activity Feed"
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-neutral-900/95 backdrop-blur-xl border-l border-neutral-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/40">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400 animate-pulse" />
          <h3 className="font-semibold text-neutral-100 text-sm tracking-wide">
            Live Database Activity Feed
          </h3>
        </div>
        <button
          onClick={onClose}
          aria-label="Close activity feed"
          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Audit Disclaimer Notice (Section 8 Requirement) */}
      <div className="px-5 py-2.5 bg-neutral-950/60 border-b border-neutral-800/80 text-[11px] text-neutral-400 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p>
          This live feed displays events received by your browser session in real time. It is an active in-memory stream, not a permanent database audit log.
        </p>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 divide-y divide-neutral-800/50">
        {activities.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center text-neutral-500 text-xs">
            <Radio className="w-8 h-8 mb-2 opacity-30 text-amber-400" />
            <p>No database events captured yet.</p>
            <p className="mt-1 text-neutral-600">Events will appear automatically when records change in Supabase.</p>
          </div>
        ) : (
          activities.map((item) => (
            <div key={item.id} className="pt-2.5 first:pt-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  {renderBadge(item.type)}
                  <span className="font-mono text-[11px] text-neutral-400">
                    public.{item.table}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-neutral-400">
                  {formatTime(item.timestamp)}
                </span>
              </div>

              {item.itemName && (
                <div className="text-xs font-medium text-neutral-200 mt-1">
                  Item: <span className="text-amber-300 font-semibold">{item.itemName}</span>
                </div>
              )}

              {item.details && (
                <p className="text-xs text-neutral-400 mt-0.5 font-sans leading-relaxed">
                  {item.details}
                </p>
              )}

              {item.recordId && (
                <div className="text-[10px] font-mono text-neutral-400 mt-1 truncate">
                  ID: {item.recordId}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950/40 text-[11px] text-neutral-500 flex justify-between items-center">
        <span>Displaying last {activities.length}/20 events</span>
        <span className="text-emerald-500 flex items-center gap-1 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Postgres Changes
        </span>
      </div>
    </aside>
  );
};
