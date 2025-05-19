
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/admin/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Receipt, Loader2, Calendar, RefreshCcw, CheckCircle, XCircle, AlertCircle, DollarSign, CreditCard, Smartphone, Printer } from "lucide-react";
import { toast } from "sonner";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExportOptions } from "@/components/admin/ExportOptions";
import { 
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useSalesData, OrderStatus } from "@/hooks/useSalesData";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SoldTickets = () => {
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 7),  // Últimos 7 dias por padrão
    end: new Date()
  });

  const { updateOrderStatusMutation, refreshData } = useSalesData();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any>(null);
  const [isReprintDialogOpen, setIsReprintDialogOpen] = useState(false);
  const [isPrintLoading, setIsPrintLoading] = useState(false);

  // Consulta para obter os pedidos e itens dos pedidos
  const { data: ticketSales, isLoading, refetch } = useQuery({
    queryKey: ['sold-tickets', dateRange],
    queryFn: async () => {
      try {
        // Converter datas para formato ISO string para a query
        const startDate = startOfDay(dateRange.start).toISOString();
        const endDate = endOfDay(dateRange.end).toISOString();
        
        console.log(`Buscando pedidos de ${startDate} até ${endDate}`);
        
        // Buscar os pedidos entre as datas
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, created_at, total_amount, customer_name, status, payment_method')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false });
          
        if (ordersError) {
          console.error("Erro ao buscar pedidos:", ordersError);
          throw ordersError;
        }
        
        if (!orders) {
          console.log("Nenhum pedido encontrado para o período");
          return [];
        }
        
        console.log(`Encontrados ${orders.length} pedidos`);
        
        // Para cada pedido, buscar seus itens
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
          const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('product_name, quantity, product_price, subtotal')
            .eq('order_id', order.id);
            
          if (itemsError) {
            console.error(`Erro ao buscar itens do pedido ${order.id}:`, itemsError);
            throw itemsError;
          }
          
          return {
            ...order,
            items: items || []
          };
        }));
        
        console.log("Dados dos pedidos com itens:", ordersWithItems);
        return ordersWithItems;
      } catch (error) {
        console.error("Erro ao buscar fichas vendidas:", error);
        toast.error("Erro ao carregar as fichas vendidas");
        return [];
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 0 // Sempre buscar dados novos ao montar o componente
  });
  
  // Filtrar por método de pagamento
  const filteredSales = activeTab === "all" 
    ? ticketSales 
    : ticketSales?.filter(sale => sale.payment_method === activeTab);
  
  // Preparar dados para exportação
  const exportData = filteredSales?.map(ticket => ({
    id: ticket.id,
    data: format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    cliente: ticket.customer_name || "Não informado",
    status: ticket.status === "completed" ? "Concluído" : 
            ticket.status === "cancelled" ? "Cancelado" : "Pendente",
    pagamento: ticket.payment_method === "cash" ? "Dinheiro" : 
              ticket.payment_method === "credit" ? "Crédito" : 
              ticket.payment_method === "debit" ? "Débito" : 
              ticket.payment_method === "pix" ? "PIX" : "Outro",
    valor: Number(ticket.total_amount).toFixed(2),
    itens: ticket.items.length
  })) || [];
  
  // Função para filtrar últimos dias
  const filterLastDays = (days: number) => {
    setDateRange({
      start: subDays(new Date(), days),
      end: new Date()
    });
  };
  
  // Calcular totais
  const totalSales = filteredSales?.reduce((sum, order) => 
    order.status === 'completed' ? sum + Number(order.total_amount) : sum, 0) || 0;
  
  const totalTickets = filteredSales?.reduce((sum, order) => 
    order.status === 'completed' ? 
    sum + order.items.reduce((itemSum, item) => itemSum + Number(item.quantity), 0) : sum, 0) || 0;

  // Função para recarregar dados manualmente
  const handleRefresh = () => {
    console.log("Recarregando dados manualmente...");
    refetch();
    refreshData();
    toast.success("Dados atualizados");
  };
  
  // Função para atualizar status de um pedido
  const handleUpdateStatus = (orderId: number, newStatus: OrderStatus) => {
    updateOrderStatusMutation.mutate(
      { orderId, status: newStatus },
      {
        onSuccess: () => {
          refetch();
        }
      }
    );
  };

  // Função para reimprimir ficha
  const handlePrint = async (order: any) => {
    setIsPrintLoading(true);
    
    try {
      // Aqui você implementaria a lógica de impressão
      console.log("Reimprimindo ficha:", order);
      
      // Simulação de impressão (em produção, conectaria com a impressora)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Ficha reimprimida com sucesso!");
    } catch (error) {
      console.error("Erro ao reimprimir ficha:", error);
      toast.error("Erro ao reimprimir ficha");
    } finally {
      setIsPrintLoading(false);
      setIsReprintDialogOpen(false);
    }
  };

  // Obter ícone para método de pagamento
  const getPaymentIcon = (method: string | undefined) => {
    switch(method) {
      case 'cash': return <DollarSign className="h-4 w-4 mr-1 text-green-600" />;
      case 'credit': return <CreditCard className="h-4 w-4 mr-1 text-blue-600" />;
      case 'debit': return <CreditCard className="h-4 w-4 mr-1 text-purple-600" />;
      case 'pix': return <Smartphone className="h-4 w-4 mr-1 text-yellow-600" />;
      default: return <Receipt className="h-4 w-4 mr-1 text-gray-600" />;
    }
  };

  // Exibir detalhes da ficha
  const showOrderDetails = (order: any) => {
    setSelectedOrderForDetails(order);
    setIsReprintDialogOpen(true);
  };

  // Buscar dados ao montar o componente
  useEffect(() => {
    console.log("Componente SoldTickets montado, buscando dados iniciais...");
    refetch();
  }, [refetch]);

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Fichas Vendidas</h1>
          <p className="text-gray-600 text-sm">Visualize todas as fichas vendidas e seus detalhes</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            className="mr-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
          
          <ExportOptions 
            exportData={exportData}
            filename="fichas_vendidas"
          />
        </div>
      </div>
      
      {/* Filtros de Data */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Filtrar por período
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => filterLastDays(1)}
            className="text-sm"
          >
            Hoje
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => filterLastDays(7)}
            className="text-sm"
          >
            Últimos 7 dias
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => filterLastDays(30)}
            className="text-sm"
          >
            Últimos 30 dias
          </Button>
        </CardContent>
      </Card>
      
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">R$ {totalSales.toFixed(2)}</p>
            <p className="text-sm text-gray-500">
              {format(dateRange.start, "dd 'de' MMMM", { locale: ptBR })} - {format(dateRange.end, "dd 'de' MMMM", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quantidade de Fichas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{totalTickets}</p>
            <p className="text-sm text-gray-500">Fichas vendidas no período</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filtros por método de pagamento */}
      <Tabs 
        defaultValue="all" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="cash" className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1" /> Dinheiro
          </TabsTrigger>
          <TabsTrigger value="credit" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-1" /> Crédito
          </TabsTrigger>
          <TabsTrigger value="debit" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-1" /> Débito
          </TabsTrigger>
          <TabsTrigger value="pix" className="flex items-center">
            <Smartphone className="h-4 w-4 mr-1" /> PIX
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Lista de Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Lista de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : ticketSales && ticketSales.length > 0 ? (
            <div className="space-y-6">
              {ticketSales.filter(sale => activeTab === "all" || sale.payment_method === activeTab).map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                    <div>
                      <p className="font-medium">Pedido #{order.id}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      {order.customer_name && (
                        <p className="text-sm text-gray-700 mt-1">Cliente: {order.customer_name}</p>
                      )}
                      <div className="flex items-center mt-1">
                        {getPaymentIcon(order.payment_method)}
                        <span className="text-sm">
                          {order.payment_method === 'cash' ? 'Dinheiro' : 
                           order.payment_method === 'credit' ? 'Cartão de Crédito' :
                           order.payment_method === 'debit' ? 'Cartão de Débito' :
                           order.payment_method === 'pix' ? 'PIX' : 'Outro'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">R$ {Number(order.total_amount).toFixed(2)}</p>
                      <div className="flex items-center mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs mr-2 ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status === 'completed' ? 'Concluído' : 
                           order.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                        </span>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              {updateOrderStatusMutation.isPending && updateOrderStatusMutation.variables?.orderId === order.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <span className="text-xs">Status</span>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(order.id, 'completed')}
                              disabled={order.status === 'completed'}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Concluído
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(order.id, 'pending')}
                              disabled={order.status === 'pending'}
                              className="text-yellow-600"
                            >
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Pendente
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                              disabled={order.status === 'cancelled'}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancelado
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        {/* Botão de reimpressão */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2 h-8"
                          onClick={() => showOrderDetails(order)}
                        >
                          <Printer className="h-4 w-4 mr-1" /> Detalhes/Reimprimir
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-medium mb-2">Itens do pedido</p>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-gray-500">
                              {item.quantity}x R$ {Number(item.product_price).toFixed(2)}
                            </p>
                          </div>
                          <p className="font-medium">R$ {Number(item.subtotal).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma ficha vendida no período selecionado.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Modal de detalhes e reimpressão */}
      <Dialog open={isReprintDialogOpen} onOpenChange={setIsReprintDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Ficha #{selectedOrderForDetails?.id}</DialogTitle>
            <DialogDescription>
              Informações completas da ficha e opção de reimpressão
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrderForDetails && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-gray-500">Data/Hora</h3>
                <p>{format(new Date(selectedOrderForDetails.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
              </div>
              
              {selectedOrderForDetails.customer_name && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Cliente</h3>
                  <p>{selectedOrderForDetails.customer_name}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-medium text-sm text-gray-500">Método de Pagamento</h3>
                <p className="flex items-center">
                  {getPaymentIcon(selectedOrderForDetails.payment_method)}
                  {selectedOrderForDetails.payment_method === 'cash' ? 'Dinheiro' : 
                   selectedOrderForDetails.payment_method === 'credit' ? 'Cartão de Crédito' :
                   selectedOrderForDetails.payment_method === 'debit' ? 'Cartão de Débito' :
                   selectedOrderForDetails.payment_method === 'pix' ? 'PIX' : 'Outro'}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-gray-500">Status</h3>
                <p className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  selectedOrderForDetails.status === 'completed' ? 'bg-green-100 text-green-800' : 
                  selectedOrderForDetails.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedOrderForDetails.status === 'completed' ? 'Concluído' : 
                   selectedOrderForDetails.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-gray-500">Itens</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrderForDetails.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">R$ {Number(item.product_price).toFixed(2)}</TableCell>
                        <TableCell className="text-right">R$ {Number(item.subtotal).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-gray-500">Total</h3>
                <p className="text-xl font-bold text-blue-600">R$ {Number(selectedOrderForDetails.total_amount).toFixed(2)}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsReprintDialogOpen(false)} variant="outline">
              Fechar
            </Button>
            <Button 
              onClick={() => handlePrint(selectedOrderForDetails)} 
              className="bg-pdv-green hover:bg-pdv-green/90"
              disabled={isPrintLoading}
            >
              {isPrintLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Imprimindo...
                </>
              ) : (
                <>
                  <Printer className="mr-2 h-4 w-4" /> Reimprimir Ficha
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default SoldTickets;
