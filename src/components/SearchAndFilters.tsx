import React from 'react';
import { Search, X, SlidersHorizontal, Check } from 'lucide-react';

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  inStockOnly: boolean;
  onToggleInStockOnly: () => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  totalCount: number;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  inStockOnly,
  onToggleInStockOnly,
  sortBy,
  onSortByChange,
  totalCount,
}) => {
  return (
    <div className="space-y-4 py-4">
      {/* Top Bar: Search + Availability Toggle + Sorting */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search items by name or notes..."
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl pl-10 pr-9 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right controls: In Stock Only & Sort By */}
        <div className="flex items-center gap-3">
          {/* Availability Toggle */}
          <button
            onClick={onToggleInStockOnly}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
              inStockOnly
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                inStockOnly
                  ? 'bg-amber-500 border-amber-500 text-neutral-950'
                  : 'border-neutral-600'
              }`}
            >
              {inStockOnly && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span>In Stock Only</span>
          </button>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl text-xs text-neutral-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              aria-label="Sort catalog items"
              className="bg-transparent text-xs text-neutral-200 focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-neutral-900">Newest</option>
              <option value="price_asc" className="bg-neutral-900">Price: Low to High</option>
              <option value="price_desc" className="bg-neutral-900">Price: High to Low</option>
              <option value="name_asc" className="bg-neutral-900">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills & Count */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-neutral-900">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-neutral-950 font-semibold shadow-md shadow-amber-500/20'
                : 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-neutral-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-neutral-400 font-mono">
          Showing <span className="text-neutral-200 font-semibold">{totalCount}</span> {totalCount === 1 ? 'item' : 'items'}
        </div>
      </div>
    </div>
  );
};
