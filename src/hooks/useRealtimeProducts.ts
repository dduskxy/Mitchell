import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Product, ConnectionState } from '../types/product';
import { ActivityEvent } from '../types/activity';
import { RealtimeChannel } from '@supabase/supabase-js';

const MAX_ACTIVITIES = 20;
const POLLING_INTERVAL_MS = 12000;

export function useRealtimeProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  // Ref to hold the current products for diff comparison in realtime callbacks
  const productsRef = useRef<Product[]>([]);
  productsRef.current = products;

  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollingTimerRef = useRef<number | null>(null);

  // Helper to append activity
  const addActivity = useCallback((event: Omit<ActivityEvent, 'id'>) => {
    const newActivity: ActivityEvent = {
      ...event,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setActivities((prev) => [newActivity, ...prev].slice(0, MAX_ACTIVITIES));
  }, []);

  // Fetch all products
  const fetchProducts = useCallback(async (isInitial = false, source: 'system' | 'polling' = 'system') => {
    if (isInitial) {
      setIsLoading(true);
    }
    try {
      const { data, error: fetchErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) {
        throw fetchErr;
      }

      setProducts(data || []);
      setLastSyncTime(new Date());
      setError(null);

      if (isInitial) {
        addActivity({
          type: 'SYSTEM',
          table: 'products',
          timestamp: new Date().toISOString(),
          details: `Initial catalog loaded (${(data || []).length} items)`,
          source: 'system',
        });
      } else if (source === 'polling') {
        // Only log polling update if count or items changed
        const currentIds = productsRef.current.map((p) => p.id).join(',');
        const newIds = (data || []).map((p) => p.id).join(',');
        if (currentIds !== newIds || (data || []).length !== productsRef.current.length) {
          addActivity({
            type: 'SYSTEM',
            table: 'products',
            timestamp: new Date().toISOString(),
            details: `Sync via polling fallback updated list (${(data || []).length} items)`,
            source: 'polling',
          });
        }
      }
    } catch (err: any) {
      console.warn('Error fetching products from Supabase:', err);
      // Helpful error message if table does not exist
      if (err?.code === 'PGRST205' || err?.message?.includes('schema cache')) {
        setError(
          "Table 'public.products' does not exist yet in your Supabase project. Please execute the migration SQL to create the table and enable Realtime."
        );
      } else {
        setError(err?.message || 'Failed to connect to Supabase database.');
      }
    } finally {
      if (isInitial) {
        setIsLoading(false);
      }
    }
  }, [addActivity]);

  // Polling setup for fallback
  const startPolling = useCallback(() => {
    if (pollingTimerRef.current !== null) return;
    setConnectionState('fallback_polling');
    pollingTimerRef.current = window.setInterval(() => {
      fetchProducts(false, 'polling');
    }, POLLING_INTERVAL_MS);
  }, [fetchProducts]);

  const stopPolling = useCallback(() => {
    if (pollingTimerRef.current !== null) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  // Setup Realtime Subscription
  useEffect(() => {
    // 1. Initial data fetch
    fetchProducts(true);

    // 2. Setup channel
    setConnectionState('connecting');
    const channel = supabase
      .channel('products-live-stream')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          const nowIso = new Date().toISOString();
          setLastSyncTime(new Date());

          if (payload.eventType === 'INSERT') {
            const newRecord = payload.new as Product;
            setProducts((prev) => [newRecord, ...prev.filter((p) => p.id !== newRecord.id)]);
            addActivity({
              type: 'INSERT',
              table: 'products',
              recordId: newRecord.id,
              itemName: newRecord.name,
              timestamp: nowIso,
              details: `Added new product "${newRecord.name}" ($${Number(newRecord.price).toFixed(2)})`,
              source: 'realtime',
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Product;
            const prevItem = productsRef.current.find((p) => p.id === updated.id);

            // Compute changed fields
            const changes: { field: string; oldValue?: any; newValue?: any }[] = [];
            if (prevItem) {
              if (prevItem.name !== updated.name) {
                changes.push({ field: 'name', oldValue: prevItem.name, newValue: updated.name });
              }
              if (Number(prevItem.price) !== Number(updated.price)) {
                changes.push({ field: 'price', oldValue: prevItem.price, newValue: updated.price });
              }
              if (prevItem.is_available !== updated.is_available) {
                changes.push({
                  field: 'is_available',
                  oldValue: prevItem.is_available,
                  newValue: updated.is_available,
                });
              }
              if (prevItem.category !== updated.category) {
                changes.push({ field: 'category', oldValue: prevItem.category, newValue: updated.category });
              }
            }

            const changeDesc = changes.length > 0
              ? changes.map((c) => `${c.field}: ${c.oldValue} → ${c.newValue}`).join(', ')
              : 'Record details updated';

            setProducts((prev) =>
              prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
            );

            addActivity({
              type: 'UPDATE',
              table: 'products',
              recordId: updated.id,
              itemName: updated.name,
              timestamp: nowIso,
              details: changeDesc,
              source: 'realtime',
              changes,
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            const deletedItem = productsRef.current.find((p) => p.id === deletedId);
            const itemName = deletedItem?.name || `Item ${deletedId ? deletedId.slice(0, 8) : 'unknown'}`;

            setProducts((prev) => prev.filter((item) => item.id !== deletedId));

            addActivity({
              type: 'DELETE',
              table: 'products',
              recordId: deletedId,
              itemName,
              timestamp: nowIso,
              details: `Removed "${itemName}" from catalog`,
              source: 'realtime',
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionState('live');
          stopPolling();
          addActivity({
            type: 'SYSTEM',
            table: 'products',
            timestamp: new Date().toISOString(),
            details: 'Supabase Realtime connected (Listening to public.products)',
            source: 'system',
          });
        } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
          setConnectionState('reconnecting');
          startPolling();
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionState('fallback_polling');
          startPolling();
        }
      });

    channelRef.current = channel;

    // Handle tab refocus / online recovery
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProducts(false);
      }
    };
    const handleOnline = () => {
      fetchProducts(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      stopPolling();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchProducts, addActivity, startPolling, stopPolling]);

  return {
    products,
    isLoading,
    error,
    connectionState,
    lastSyncTime,
    activities,
    refetch: () => fetchProducts(false),
  };
}
