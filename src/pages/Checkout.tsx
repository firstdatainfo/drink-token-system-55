
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Receipt, 
  ShoppingBag, 
  Check,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useSalesData, PaymentMethod } from "@/hooks/useSalesData";

const Checkout = () => {
  const { cart, getTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [customerName, setCustomerName] = useState("");
  
  // Utilizar o hook useSalesData para salvar o pedido
  const { createOrderMutation } = useSalesData();
  const isProcessing = createOrderMutation.isPending;

  const handlePaymentSubmit = async () => {
    if (!paymentMethod) {
      toast.error("Por favor, selecione um método de pagamento");
      return;
    }

    try {
      // Criar o objeto do pedido com os dados necessários
      const orderItems = cart.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity
      }));

      const orderData = {
        customer_name: customerName || undefined,
        total_amount: getTotal(),
        status: "completed" as const,
        payment_method: paymentMethod,
        items: orderItems
      };

      // Chamar a mutação para criar o pedido
      await createOrderMutation.mutateAsync(orderData);
      
      // Limpar carrinho após sucesso
      clearCart();
      navigate("/");
    } catch (error) {
      console.error("Erro ao processar pedido:", error);
      toast.error("Erro ao processar pedido. Tente novamente.");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 min-h-screen flex flex-col items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-center">Carrinho Vazio</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>Seu carrinho está vazio. Adicione produtos antes de continuar.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate("/")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Produtos
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para produtos
      </Button>
      
      <h1 className="text-2xl font-bold text-pdv-blue mb-6">Finalizar Pedido</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Cliente (Opcional)</Label>
                    <Input 
                      id="name" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Digite o nome do cliente" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Método de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant={paymentMethod === "credit" ? "default" : "outline"} 
                  className={`h-24 flex flex-col ${paymentMethod === "credit" ? "bg-pdv-blue text-white" : ""}`}
                  onClick={() => setPaymentMethod("credit")}
                >
                  <CreditCard className="h-8 w-8 mb-2" />
                  <span>Cartão de Crédito</span>
                </Button>
                
                <Button 
                  variant={paymentMethod === "debit" ? "default" : "outline"} 
                  className={`h-24 flex flex-col ${paymentMethod === "debit" ? "bg-pdv-blue text-white" : ""}`}
                  onClick={() => setPaymentMethod("debit")}
                >
                  <CreditCard className="h-8 w-8 mb-2" />
                  <span>Cartão de Débito</span>
                </Button>
                
                <Button 
                  variant={paymentMethod === "cash" ? "default" : "outline"} 
                  className={`h-24 flex flex-col ${paymentMethod === "cash" ? "bg-pdv-blue text-white" : ""}`}
                  onClick={() => setPaymentMethod("cash")}
                >
                  <Banknote className="h-8 w-8 mb-2" />
                  <span>Dinheiro</span>
                </Button>
                
                <Button 
                  variant={paymentMethod === "pix" ? "default" : "outline"} 
                  className={`h-24 flex flex-col ${paymentMethod === "pix" ? "bg-pdv-blue text-white" : ""}`}
                  onClick={() => setPaymentMethod("pix")}
                >
                  <QrCode className="h-8 w-8 mb-2" />
                  <span>Pix</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="mr-2" />
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.product.name}
                  </span>
                  <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-pdv-blue">R$ {getTotal().toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-pdv-green hover:bg-pdv-green/90"
                onClick={handlePaymentSubmit}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Confirmar Pagamento
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
