
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/admin/Layout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Printer, CreditCard, Database, Rocket, Loader2, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Dados estáticos como fallback
const fallbackSalesData = [
  { name: 'Segunda', vendas: 1200 },
  { name: 'Terça', vendas: 1900 },
  { name: 'Quarta', vendas: 800 },
  { name: 'Quinta', vendas: 1600 },
  { name: 'Sexta', vendas: 2300 },
  { name: 'Sábado', vendas: 1500 },
  { name: 'Domingo', vendas: 500 }
];

const fallbackStats = {
  totalSales: 9800,
  ordersToday: 24,
  topProduct: "Ficha - Alimentação"
};

const Admin = () => {
  const navigate = useNavigate();
  
  // Buscar dados de vendas da semana do Supabase com configuração otimizada e fallback
  const { data: salesData = fallbackSalesData, isLoading: isLoadingSales } = useQuery({
    queryKey: ['admin-sales-data'],
    queryFn: async () => {
      const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
      
      try {
        const { data: orders, error } = await supabase
          .from('orders')
          .select('total_amount, created_at');
        
        if (error) throw error;
        
        // Agrupar vendas por dia da semana
        const salesByDay = daysOfWeek.map(day => ({
          name: day,
          vendas: 0
        }));
        
        // Se tiver dados de pedidos, processar
        if (orders && orders.length > 0) {
          orders.forEach(order => {
            const date = new Date(order.created_at);
            const dayIndex = date.getDay(); // 0 = Domingo, 1 = Segunda, etc.
            const mappedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Converter para 0 = Segunda, ..., 6 = Domingo
            salesByDay[mappedIndex].vendas += Number(order.total_amount);
          });
        }
        
        console.log("Dados de vendas carregados:", salesByDay);
        return salesByDay;
      } catch (error) {
        console.error("Erro ao buscar dados de vendas:", error);
        return fallbackSalesData;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1,
  });
  
  // Buscar estatísticas gerais com configuração otimizada e fallback
  const { data: stats = fallbackStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        // Total de vendas da semana
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Segunda-feira
        startOfWeek.setHours(0, 0, 0, 0);
        
        const { data: weekOrders, error: weekError } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', startOfWeek.toISOString());
        
        if (weekError) throw weekError;
        
        // Total de pedidos hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: todayOrders, error: todayError } = await supabase
          .from('orders')
          .select('id')
          .gte('created_at', today.toISOString());
        
        if (todayError) throw todayError;
        
        // Produto mais vendido
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select('product_name, quantity');
        
        if (itemsError) throw itemsError;
        
        // Calcular total de vendas da semana
        const totalSales = weekOrders?.reduce((sum, order) => {
          // Garantir que order.total_amount seja convertido para número
          const amount = typeof order.total_amount === 'number' ? order.total_amount : 
                         Number(order.total_amount) || 0;
          return sum + amount;
        }, 0) || 0;
        
        // Contar pedidos de hoje
        const ordersToday = todayOrders?.length || 0;
        
        // Encontrar produto mais vendido
        const productCounts: Record<string, number> = {};
        orderItems?.forEach(item => {
          const productName = item.product_name;
          if (!productCounts[productName]) {
            productCounts[productName] = 0;
          }
          // Garantir que item.quantity seja convertido para número
          const quantity = typeof item.quantity === 'number' ? item.quantity : 
                          Number(item.quantity) || 0;
          productCounts[productName] += quantity;
        });
        
        let topProduct = "Nenhum";
        let maxCount = 0;
        
        Object.entries(productCounts).forEach(([product, count]) => {
          if (count > maxCount) {
            maxCount = count;
            topProduct = product;
          }
        });
        
        console.log("Estatísticas carregadas:", { totalSales, ordersToday, topProduct });
        
        return {
          totalSales,
          ordersToday,
          topProduct
        };
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        return fallbackStats;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true, // Atualizar ao focar na janela
    retry: 1,
  });

  return (
    <Layout>
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-medium">Total de Vendas</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Vendas da semana atual</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Carregando...</span>
              </div>
            ) : (
              <p className="text-xl sm:text-3xl font-bold text-pdv-blue">
                R$ {stats.totalSales.toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-medium">Pedidos</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Total de pedidos hoje</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Carregando...</span>
              </div>
            ) : (
              <p className="text-xl sm:text-3xl font-bold text-pdv-green">{stats.ordersToday}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-medium">Produto mais vendido</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Nesta semana</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Carregando...</span>
              </div>
            ) : (
              <p className="text-sm sm:text-xl font-bold text-pdv-orange truncate">{stats.topProduct}</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-4 sm:mb-6">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Vendas por dia da semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-80">
            {isLoadingSales ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-pdv-blue" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="vendas" fill="#0EA5E9" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Configurações e Integrações */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Configurações e Integrações</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Configure impressoras e integrações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Configurações de Impressora */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Printer className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Configurações de Impressão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-xs sm:text-sm text-gray-500">Modelos de Impressora:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button variant="outline" size="sm" className="text-xs">48mm</Button>
                  <Button variant="outline" size="sm" className="text-xs">58mm</Button>
                  <Button variant="outline" size="sm" className="text-xs">80mm</Button>
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full text-xs sm:text-sm"
                  onClick={() => navigate("/admin/printer-settings")}
                >
                  Configurar Impressora
                </Button>
              </CardContent>
            </Card>
            
            {/* Integrações */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Integrações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-pdv-blue" />
                      <span className="text-xs sm:text-sm">Stone Pagamentos</span>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">Conectar</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Database className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-pdv-green" />
                      <span className="text-xs sm:text-sm">Supabase</span>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">Conectar</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Rocket className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-black" />
                      <span className="text-xs sm:text-sm">Vercel</span>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">Conectar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Acesso rápido</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 sm:gap-4">
            <Button 
              onClick={() => navigate("/admin/products")}
              className="text-xs sm:text-sm"
              size="sm"
            >
              Gerenciar Produtos
            </Button>
            <Button 
              onClick={() => navigate("/admin/categories")}
              className="text-xs sm:text-sm"
              size="sm"
            >
              Gerenciar Categorias
            </Button>
            <Button 
              onClick={() => navigate("/admin/fichas-vendidas")}
              className="text-xs sm:text-sm"
              size="sm"
              variant="action"
            >
              <Receipt className="h-4 w-4" />
              Fichas Vendidas
            </Button>
            <Button 
              onClick={() => navigate("/admin/reports")}
              className="text-xs sm:text-sm"
              size="sm"
            >
              Relatórios
            </Button>
            <Button 
              onClick={() => navigate("/")}
              className="text-xs sm:text-sm"
              size="sm"
            >
              Ir para PDV
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Admin;
