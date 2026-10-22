import { useState, useMemo } from 'react';
import { useRealtimeProducts } from './hooks/useRealtimeProducts';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SearchAndFilters } from './components/SearchAndFilters';
import { ProductGrid } from './components/ProductGrid';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorState } from './components/ErrorState';
import { ActivityFeedDrawer } from './components/ActivityFeedDrawer';
import { SQLMigrationModal } from './components/SQLMigrationModal';
import { AIChatModal } from './components/AIChatModal';
import { Footer } from './components/Footer';

export function App() {
  const {
    products,
    isLoading,
    error,
    connectionState,
    lastSyncTime,
    activities,
    refetch,
  } = useRealtimeProducts();

  // Local UI filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Modals & Drawers
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Derive unique categories dynamically from actual database products
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search filter (name or description)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }

        // In-stock only filter
        if (inStockOnly && !p.is_available) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') {
          return Number(a.price) - Number(b.price);
        }
        if (sortBy === 'price_desc') {
          return Number(b.price) - Number(a.price);
        }
        if (sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        // default 'newest'
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [products, searchQuery, selectedCategory, inStockOnly, sortBy]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setInStockOnly(false);
    setSortBy('newest');
  };

  const isFiltered =
    Boolean(searchQuery.trim()) || selectedCategory !== 'all' || inStockOnly;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navigation Header */}
      <Header
        status={connectionState}
        lastSyncTime={lastSyncTime}
        activityCount={activities.length}
        onRefresh={handleManualRefresh}
        onToggleActivity={() => setIsActivityOpen((prev) => !prev)}
        onOpenMigrationModal={() => setIsMigrationModalOpen(true)}
        isRefreshing={isRefreshing}
      />

      {/* Hero Banner */}
      <Hero />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* If error loading catalog */}
        {error ? (
          <ErrorState
            message={error}
            onRetry={refetch}
            onOpenMigrationModal={() => setIsMigrationModalOpen(true)}
          />
        ) : (
          <>
            {/* Search, Filter, & Sort Controls */}
            <SearchAndFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              inStockOnly={inStockOnly}
              onToggleInStockOnly={() => setInStockOnly((prev) => !prev)}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              totalCount={filteredProducts.length}
            />

            {/* Product Grid or Loading Skeleton */}
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <ProductGrid
                products={filteredProducts}
                isFiltered={isFiltered}
                onResetFilters={handleResetFilters}
                onOpenMigrationModal={() => setIsMigrationModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Live Activity Feed Side Drawer */}
      <ActivityFeedDrawer
        activities={activities}
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
      />

      {/* SQL Migration Modal */}
      <SQLMigrationModal
        isOpen={isMigrationModalOpen}
        onClose={() => setIsMigrationModalOpen(false)}
      />

      {/* AI Barista Chatbot (Users provide their own Google Gemini API Key) */}
      <AIChatModal products={products} />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
