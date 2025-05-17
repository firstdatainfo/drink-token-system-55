import { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
interface ProductGridProps {
  products: Product[];
}
export function ProductGrid({
  products
}: ProductGridProps) {
  return <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 px-0 my-0 mx-0 py-[px]">
      {products.map(product => <ProductCard key={product.id} product={product} />)}
    </div>;
}