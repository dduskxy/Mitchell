# Mitchell — Autonomous Supabase Realtime Catalog & Digital Menu

[![Deploy Mitchell to GitHub Pages](https://github.com/dduskxy/Mitchell/actions/workflows/deploy.yml/badge.svg)](https://github.com/dduskxy/Mitchell/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Demo-https%3A%2F%2Fdduskxy.github.io%2FMitchell%2F-amber)](https://dduskxy.github.io/Mitchell/)
[![Supabase Realtime](https://img.shields.io/badge/Supabase-Realtime%20Enabled-3ECF8E?logo=supabase)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A production-grade, autonomous real-time product catalog and digital menu application built with **React 19**, **TypeScript**, **Vite**, and **Supabase Realtime**.

Any modification in the Supabase Table Editor (adding an item, altering prices, changing descriptions, or toggling item availability) instantaneously synchronizes across all active browser clients via WebSocket **without pressing F5 or reloading the webpage**.

---

## 1. Project Overview

Mitchell is engineered as an artisanal cafe and digital menu platform showcasing live database synchronization:
- **Instant Updates**: Sub-second UI updates via Postgres Changes channel.
- **Resilient Fallback**: Auto-reconnect with 12s polling fallback when connection drops.
- **Security-First**: Enforced PostgreSQL Row Level Security (RLS) allowing anonymous read-only access while safeguarding mutation rights.
- **Zero Config CI/CD**: Automatic production deployment to GitHub Pages via GitHub Actions.

---

## 2. Key Features

- **Live Database Activity Feed**: Slide-out event drawer displaying `INSERT`, `UPDATE`, `DELETE`, and `SYSTEM` events with exact timestamp, item ID, and field-level diffs.
- **Connection Health Indicator**: Realtime connection status badge (`Live`, `Connecting`, `Reconnecting`, `Polling Fallback`, `Connection Error`) and last sync timestamp.
- **Dynamic Category Filtering**: Categories are dynamically generated from live database rows.
- **Instant Search**: Client-side name and description search with zero database thrashing.
- **Availability State**: Instant reflection when items are toggled in or out of stock.
- **Graceful Error & Empty States**: Comprehensive empty states and table creation wizards with copyable SQL.
- **Fully Responsive**: Mobile-first fluid design with glassmorphic cards and dark aesthetic.

---

## 3. Technology Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/) with base path `/Mitchell/`
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database & Realtime**: [Supabase](https://supabase.com/) (`@supabase/supabase-js` v2)
- **Deployment**: [GitHub Actions](https://github.com/features/actions) + [GitHub Pages](https://pages.github.com/)

---

## 4. Local Development Setup

### Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- npm 10+

### Installation

```bash
# Clone the repository
git clone git@github.com:dduskxy/Mitchell.git
cd Mitchell

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/Mitchell/` in your browser.

### Docker Desktop Setup (Port 8080:80)

Run Mitchell instantly inside a lightweight Nginx container:

```bash
# Build and run with Docker Compose
docker compose up -d --build

# View container logs
docker compose logs -f

# Stop container
docker compose down
```

Open your browser at **`http://localhost:8080/`**.

---

## 5. Environment Variables

Create `.env.local` for local override (optional, defaults are embedded safely for public read):

```env
VITE_SUPABASE_URL=https://jsajtnrvocialfaupjxw.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_VVLUy21pC0VCHmAVpNMhXw_nsnNiVLP
```

> [!NOTE]
> The publishable key is a public client key. It is strictly scoped by PostgreSQL Row Level Security and safe to expose in frontend client bundles. Never include the `service_role` secret key.

---

## 6. Supabase Database Schema

The database migration is located at [`supabase/migrations/20261023000000_create_products.sql`](supabase/migrations/20261023000000_create_products.sql):

```sql
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

-- Fast query indices
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
```

---

## 7. Row Level Security (RLS) Policies

To protect the database according to least-privilege principles, RLS is enabled with public read-only access:

```sql
-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public (anon & authenticated) read-only access
CREATE POLICY "Allow public read access to products"
    ON public.products
    FOR SELECT
    TO anon, authenticated
    USING (true);
```

All modifications (`INSERT`, `UPDATE`, `DELETE`) are performed via the authenticated Supabase Dashboard Table Editor or authorized backend routines.

---

## 8. Realtime Configuration

For changes to be broadcast over WebSocket with old values present during `UPDATE` and `DELETE`:

```sql
-- Enable FULL replica identity for rich diff payloads
ALTER TABLE public.products REPLICA IDENTITY FULL;

-- Add table to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
```

---

## 9. Migration Instructions

To run the migration on your Supabase project:

1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/jsajtnrvocialfaupjxw).
2. Navigate to **SQL Editor** -> **New Query**.
3. Copy the contents of [`supabase/migrations/20261023000000_create_products.sql`](supabase/migrations/20261023000000_create_products.sql).
4. Click **Run**.
5. Your database table will be initialized and populated with sample artisanal menu items.

---

## 10. How to Test Realtime Sync Without Refreshing

1. Open the deployed website: [`https://dduskxy.github.io/Mitchell/`](https://dduskxy.github.io/Mitchell/) (or `http://localhost:5173/Mitchell/`).
2. Notice the connection badge displays **Realtime Live**.
3. Open your [Supabase Table Editor](https://supabase.com/dashboard/project/jsajtnrvocialfaupjxw/editor) in another window.
4. Try any of the following:
   - **Edit Price**: Change price from `145.00` to `99.00`.
   - **Edit Name**: Change "Mitchell Signature Dirty" to "Mitchell Signature Cold Dirty".
   - **Toggle Availability**: Switch `is_available` from `true` to `false`.
   - **Add Row**: Insert a new menu item.
   - **Delete Row**: Delete an item.
5. Notice that the catalog card updates **instantly** without pressing F5, and the **Activity Feed** drawer records the exact change details!

---

## 11. GitHub Actions Deployment

The workflow `.github/workflows/deploy.yml` automatically triggers on every push to `main`:
1. Checks out repository.
2. Installs dependencies using `npm ci`.
3. Compiles TypeScript and builds production assets with `base: '/Mitchell/'`.
4. Uploads build artifacts to GitHub Pages.
5. Deploys to `https://dduskxy.github.io/Mitchell/`.

---

## 12. Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| Status shows "Connection Error" / "Table does not exist" | Table `public.products` not yet migrated | Run the SQL migration in `supabase/migrations/20261023000000_create_products.sql` via Supabase SQL Editor. |
| Products show on load, but don't update on edit | Table not added to publication | Run `ALTER PUBLICATION supabase_realtime ADD TABLE public.products;` |
| `DELETE` event has empty details | Missing Replica Identity | Run `ALTER TABLE public.products REPLICA IDENTITY FULL;` |
| 404 assets on GitHub Pages | Incorrect base path | Verify `vite.config.ts` has `base: '/Mitchell/'`. |

---

## License

MIT © [dduskxy](https://github.com/dduskxy)
