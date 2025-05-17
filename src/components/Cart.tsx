
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function Cart() {
  const {
    cart,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
    getTotal,
  } = useCart();

  if (cart.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-pdv-darkgray">
            <ShoppingCart className="mr-2" /> 
            Carrinho
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <ShoppingCart className="mx-auto h-12 w-12 opacity-20 mb-2" />
            <p>Seu carrinho está vazio</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-xl text-pdv-darkgray">
            <ShoppingCart className="mr-2" /> 
            Carrinho
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Limpar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-auto py-2">
        {cart.map((item) => (
          <div key={item.product.id} className="mb-3">
            <div className="flex justify-between items-center">
              <div className="flex-grow">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  R$ {item.product.price.toFixed(2)} x {item.quantity}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => decreaseQuantity(item.product.id)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => increaseQuantity(item.product.id)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm font-medium">
                Total: R$ {(item.product.price * item.quantity).toFixed(2)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFromCart(item.product.id)}
                className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Separator className="mt-3" />
          </div>
        ))}
      </CardContent>
      
      <CardFooter className="flex-col border-t pt-4">
        <div className="w-full flex justify-between items-center text-xl font-bold mb-4">
          <span>Total</span>
          <span className="text-pdv-blue">R$ {getTotal().toFixed(2)}</span>
        </div>
        <Button className="w-full bg-pdv-green hover:bg-pdv-green/90 text-white">
          Finalizar Pedido
        </Button>
      </CardFooter>
    </Card>
  );
}
