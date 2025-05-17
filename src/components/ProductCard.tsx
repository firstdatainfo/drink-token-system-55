
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({
  product
}: ProductCardProps) {
  const {
    addToCart
  } = useCart();
  
  return (
    <Card className="h-full overflow-hidden transition-shadow hover:shadow-md flex flex-col">
      <CardContent className="p-4 flex flex-col justify-between h-full w-full">
        <div className="flex justify-center items-center mb-2 p-2">
          <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-32 h-32 object-contain" />
        </div>
        <div className="flex flex-col flex-grow">
          <h3 className="font-medium text-center mb-1">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-gray-600 text-center mb-2 line-clamp-2">{product.description}</p>
          )}
          <div className="flex flex-col mt-auto">
            <p className="text-xl text-pdv-blue text-center font-bold">
              R$ {product.price.toFixed(2)}
            </p>
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={() => addToCart(product)} className="bg-pdv-orange hover:bg-pdv-orange/90 text-white px-3 py-1 font-semibold">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
