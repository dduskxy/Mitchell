-- ====================================================================
-- Migration: 20261023000000_create_products.sql
-- Description: Create products table with RLS, Realtime publication,
--              updated_at trigger, and sample seed data.
-- ====================================================================

-- 1. Create public.products table
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

-- 4. Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public (anon & authenticated) read access
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products"
    ON public.products
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 5. Realtime Configuration
-- Set replica identity to FULL so that UPDATE and DELETE payloads include old record values
ALTER TABLE public.products REPLICA IDENTITY FULL;

-- Add table to supabase_realtime publication (if not already added)
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

-- 6. Seed Data (Modern Bistro / Specialty Cafe Menu)
INSERT INTO public.products (name, description, price, category, image_url, is_available)
VALUES
    (
        'Mitchell Signature Dirty',
        'Double ristretto pulled over cold velvety milk infused with hazelnut nuance.',
        145.00,
        'Espresso Bar',
        'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
        true
    ),
    (
        'Artisan Single-Origin Pourover',
        'Ethiopian Yirgacheffe with bright notes of bergamot, peach blossoms, and jasmine.',
        180.00,
        'Espresso Bar',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        true
    ),
    (
        'Midnight Nitro Cold Brew',
        'Slow-steeped for 24 hours and nitrogen-infused for a silky cascade and chocolate finish.',
        160.00,
        'Cold Brew',
        'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
        true
    ),
    (
        'Uji Ceremonial Matcha Latte',
        'First-harvest ceremonial grade Uji matcha whisked with oat milk and Madagascar vanilla.',
        175.00,
        'Specialty Drinks',
        'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
        true
    ),
    (
        'Yuzu Sparkling Espresso',
        'Sparkling tonic blended with organic Kochi yuzu purée and topped with a shot of floral espresso.',
        165.00,
        'Specialty Drinks',
        'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
        true
    ),
    (
        'Pain au Chocolat Feuilleté',
        'Flaky French butter laminated pastry folded around rich Valrhona 66% dark chocolate batons.',
        120.00,
        'Artisan Bakery',
        'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=800&q=80',
        true
    ),
    (
        'Almond Frangipane Croissant',
        'Twice-baked butter croissant filled with almond cream and crowned with toasted sliced almonds.',
        135.00,
        'Artisan Bakery',
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
        true
    ),
    (
        'Truffle Scrambled Egg Sourdough',
        'Organic eggs scrambled with black truffle butter served on toasted country sourdough.',
        290.00,
        'Brunch',
        'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
        false
    )
ON CONFLICT DO NOTHING;
