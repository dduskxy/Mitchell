import React from 'react';
import { ConnectionState } from '../types/product';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionBadgeProps {
  status: ConnectionState;
  lastSyncTime: Date | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const ConnectionBadge: React.FC<ConnectionBadgeProps> = ({
  status,
  lastSyncTime,
  onRefresh,
  isRefreshing,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'live':
        return {
          label: 'Realtime Live',
          dotColor: 'bg-emerald-500',
          pulseColor: 'bg-emerald-400',
          textColor: 'text-emerald-300',
          borderColor: 'border-emerald-500/30',
          bgBadge: 'bg-emerald-950/60',
        };
      case 'connecting':
        return {
          label: 'Connecting...',
          dotColor: 'bg-amber-500',
          pulseColor: 'bg-amber-400',
          textColor: 'text-amber-300',
          borderColor: 'border-amber-500/30',
          bgBadge: 'bg-amber-950/60',
        };
      case 'reconnecting':
        return {
          label: 'Reconnecting...',
          dotColor: 'bg-orange-500',
          pulseColor: 'bg-orange-400',
          textColor: 'text-orange-300',
          borderColor: 'border-orange-500/30',
          bgBadge: 'bg-orange-950/60',
        };
      case 'fallback_polling':
        return {
          label: 'Polling Fallback',
          dotColor: 'bg-sky-500',
          pulseColor: 'bg-sky-400',
          textColor: 'text-sky-300',
          borderColor: 'border-sky-500/30',
          bgBadge: 'bg-sky-950/60',
        };
      case 'error':
      default:
        return {
          label: 'Connection Error',
          dotColor: 'bg-rose-500',
          pulseColor: 'bg-rose-400',
          textColor: 'text-rose-300',
          borderColor: 'border-rose-500/30',
          bgBadge: 'bg-rose-950/60',
        };
    }
  };

  const config = getStatusConfig();

  const formatLastSync = (time: Date | null) => {
    if (!time) return 'Pending sync';
    const hours = time.getHours().toString().padStart(2, '0');
    const mins = time.getMinutes().toString().padStart(2, '0');
    const secs = time.getSeconds().toString().padStart(2, '0');
    return `${hours}:${mins}:${secs}`;
  };

  return (
    <div className="flex items-center gap-3">
      {/* Realtime Status Indicator */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium backdrop-blur-md transition-all ${config.borderColor} ${config.bgBadge} ${config.textColor}`}
      >
        <span className="relative flex h-2 w-2">
          {status === 'live' && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pulseColor}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
        </span>
        <span className="tracking-wide">{config.label}</span>
        {status === 'live' ? (
          <Wifi className="w-3.5 h-3.5 opacity-80" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 opacity-80" />
        )}
      </div>

      {/* Sync Time & Manual Refresh */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 bg-neutral-900/80 px-2.5 py-1.5 rounded-full border border-neutral-800">
        <span>Synced:</span>
        <span className="font-mono text-neutral-200">{formatLastSync(lastSyncTime)}</span>
        <button
          onClick={onRefresh}
          title="Manual sync"
          className="ml-1 p-0.5 hover:text-amber-400 transition-colors cursor-pointer rounded focus:outline-none"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>
    </div>
  );
};
