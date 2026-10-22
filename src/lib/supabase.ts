import { createClient } from '@supabase/supabase-js';

// Centralized configuration with fallback for GitHub Pages static build
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://jsajtnrvocialfaupjxw.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_VVLUy21pC0VCHmAVpNMhXw_nsnNiVLP';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
