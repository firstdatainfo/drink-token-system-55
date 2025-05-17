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
      <CardContent className="p-4 flex flex-col justify-between h-full px-0 py-0 mx-0 my-0">
        <div className="flex justify-center items-center mb-2 p-2 py-0 px-[7px]">
          <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-32 h-32 object-contain" />
        </div>
        <div>
          <h3 className="font-medium text-center">{product.name}</h3>
          <div className="flex flex-col mt-2">
            <p className="text-xl text-pdv-blue text-center font-bold px-[12px]">
              R$ {product.price.toFixed(2)}
            </p>
            <div className="flex justify-end mt-1">
              <Button size="sm" onClick={() => addToCart(product)} className="bg-pdv-orange hover:bg-pdv-orange/90 text-white px-3 py-1 font-semibold">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
}