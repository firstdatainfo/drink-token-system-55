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
  return <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div className="flex justify-center items-center mb-2 p-2">
          <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-16 h-16 object-contain" />
        </div>
        <div>
          <h3 className="font-medium text-center">{product.name}</h3>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xl font-bold text-pdv-blue">
              R$ {product.price.toFixed(2)}
            </p>
            <Button size="sm" onClick={() => addToCart(product)} className="bg-pdv-orange hover:bg-pdv-orange/90 text-white px-[2px] mx-0 my-[22px] py-0 font-semibold">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>;
}