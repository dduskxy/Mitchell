import React, { useState } from 'react';
import { X, Copy, Check, Database, ExternalLink, Shield, Zap } from 'lucide-react';

interface SQLMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MIGRATION_SQL = `-- 1. Create public.products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL DEFAULT 'General',
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Indexes for fast filtering & sorting
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 3. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products"
    ON public.products
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 5. Realtime Configuration
-- Set replica identity to FULL so UPDATE and DELETE payloads contain old record values
ALTER TABLE public.products REPLICA IDENTITY FULL;

-- Add table to supabase_realtime publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'products'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    END IF;
END $$;

-- 6. Sample Seed Items
INSERT INTO public.products (name, description, price, category, image_url, is_available)
VALUES
    ('Mitchell Signature Dirty', 'Double ristretto pulled over cold velvety milk infused with hazelnut nuance.', 145.00, 'Espresso Bar', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80', true),
    ('Artisan Single-Origin Pourover', 'Ethiopian Yirgacheffe with bright notes of bergamot, peach blossoms, and jasmine.', 180.00, 'Espresso Bar', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', true),
    ('Midnight Nitro Cold Brew', 'Slow-steeped for 24 hours and nitrogen-infused for a silky cascade and chocolate finish.', 160.00, 'Cold Brew', 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80', true),
    ('Uji Ceremonial Matcha Latte', 'First-harvest ceremonial grade Uji matcha whisked with oat milk and Madagascar vanilla.', 175.00, 'Specialty Drinks', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80', true),
    ('Yuzu Sparkling Espresso', 'Sparkling tonic blended with organic Kochi yuzu purée and topped with a shot of floral espresso.', 165.00, 'Specialty Drinks', 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80', true),
    ('Pain au Chocolat Feuilleté', 'Flaky French butter laminated pastry folded around rich Valrhona 66% dark chocolate batons.', 120.00, 'Artisan Bakery', 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=800&q=80', true),
    ('Almond Frangipane Croissant', 'Twice-baked butter croissant filled with almond cream and crowned with toasted sliced almonds.', 135.00, 'Artisan Bakery', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80', true),
    ('Truffle Scrambled Egg Sourdough', 'Organic eggs scrambled with black truffle butter served on toasted country sourdough.', 290.00, 'Brunch', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', false)
ON CONFLICT DO NOTHING;`;

export const SQLMigrationModal: React.FC<SQLMigrationModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(MIGRATION_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/50">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-neutral-100">Supabase SQL Migration & Schema</h2>
              <p className="text-xs text-neutral-400">Project Reference: jsajtnrvocialfaupjxw</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Features Bar */}
        <div className="px-6 py-3 bg-neutral-950/30 border-b border-neutral-800/80 flex flex-wrap items-center gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Shield className="w-3.5 h-3.5" />
            RLS Enabled (Public Read)
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <Zap className="w-3.5 h-3.5" />
            Realtime Publication Included
          </span>
          <span className="flex items-center gap-1.5 text-sky-400">
            <Database className="w-3.5 h-3.5" />
            Replica Identity FULL
          </span>
        </div>

        {/* Instructions */}
        <div className="px-6 py-3 text-xs text-neutral-300 bg-neutral-850/30 border-b border-neutral-800">
          <p>
            To apply this migration to your live Supabase database:
          </p>
          <ol className="list-decimal list-inside mt-1 space-y-0.5 text-neutral-400">
            <li>Click <strong>Copy SQL</strong> below.</li>
            <li>
              Open{' '}
              <a
                href="https://supabase.com/dashboard/project/jsajtnrvocialfaupjxw/sql/new"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 underline inline-flex items-center gap-1 hover:text-amber-300"
              >
                Supabase SQL Editor <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>Paste and click <strong>Run</strong>. The website will immediately sync via Realtime!</li>
          </ol>
        </div>

        {/* Code Box */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-950 font-mono text-xs text-neutral-300 leading-relaxed">
          <pre>{MIGRATION_SQL}</pre>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-950/60">
          <div className="text-xs text-neutral-400">
            File: <code className="text-neutral-300">supabase/migrations/20261023000000_create_products.sql</code>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-neutral-950 hover:bg-amber-400 transition cursor-pointer shadow-lg shadow-amber-500/20"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-neutral-950 stroke-[3]" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy SQL Script</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
