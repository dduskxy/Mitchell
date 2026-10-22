import React, { useState } from 'react';
import { Product } from '../types/product';
import { Tag, Coffee } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imageError, setImageError] = useState(false);

  // Fallback image placeholder
  const placeholderImage =
    'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=800&q=80';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div
      className={`group relative flex flex-col rounded-2xl bg-neutral-900/50 border transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 overflow-hidden ${
        product.is_available
          ? 'border-neutral-800 hover:border-neutral-700'
          : 'border-neutral-850 opacity-75'
      }`}
    >
      {/* Image Container with 4:3 Aspect Ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-950">
        <img
          src={!imageError && product.image_url ? product.image_url : placeholderImage}
          alt={product.name}
          onError={() => setImageError(true)}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-60" />

        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          {product.is_available ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-neutral-900/90 text-neutral-400 border border-neutral-700 backdrop-blur-md">
              Sold Out
            </span>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-950/80 text-neutral-300 border border-neutral-800 backdrop-blur-md">
            <Tag className="w-3 h-3 text-amber-400" />
            {product.category || 'General'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-bold text-neutral-100 group-hover:text-amber-300 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <span className="text-base font-extrabold text-amber-400 font-mono whitespace-nowrap">
            {formatPrice(product.price)}
          </span>
        </div>

        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed flex-1">
          {product.description || 'Artisan preparation crafted with premium sourced ingredients.'}
        </p>

        {/* Card Footer */}
        <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <span className="flex items-center gap-1">
            <Coffee className="w-3 h-3 text-neutral-500" />
            Mitchell Selection
          </span>
          <span title={new Date(product.updated_at).toLocaleString()}>
            Live ID: {product.id.slice(0, 8)}
          </span>
        </div>
      </div>
    </div>
  );
};
