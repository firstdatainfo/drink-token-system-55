
import { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({
  products
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
      {products.map(product => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
