import React from 'react';
import { Product } from '../types/product';
import { ProductCard } from './ProductCard';
import { EmptyState } from './EmptyState';

interface ProductGridProps {
  products: Product[];
  isFiltered: boolean;
  onResetFilters: () => void;
  onOpenMigrationModal: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isFiltered,
  onResetFilters,
  onOpenMigrationModal,
}) => {
  if (products.length === 0) {
    return (
      <EmptyState
        isFiltered={isFiltered}
        onResetFilters={onResetFilters}
        onOpenMigrationModal={onOpenMigrationModal}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
