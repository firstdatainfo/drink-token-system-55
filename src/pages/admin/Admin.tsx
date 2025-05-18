
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/admin/Layout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Printer, CreditCard, Database, Rocket, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Admin = () => {
  const navigate = useNavigate();
  
  // Buscar dados de vendas da semana do Supabase
  const { data: salesData = [], isLoading: isLoadingSales } = useQuery({
    queryKey: ['admin-sales-data'],
    queryFn: async () => {
      const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
      
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
      
      return salesByDay;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  
  // Buscar estatísticas gerais
  const { data: stats = { totalSales: 0, ordersToday: 0, topProduct: "Carregando..." }, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Total de vendas da semana
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Segunda-feira
      startOfWeek.setHours(0, 0, 0, 0);
      
      const { data: weekOrders, error: weekError } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', startOfWeek.toISOString());
      
      // Total de pedidos hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todayOrders, error: todayError } = await supabase
        .from('orders')
        .select('id')
        .gte('created_at', today.toISOString());
      
      // Produto mais vendido
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('product_name, quantity');
      
      if (weekError || todayError || itemsError) throw new Error("Erro ao buscar estatísticas");
      
      // Calcular total de vendas da semana
      const totalSales = weekOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      
      // Contar pedidos de hoje
      const ordersToday = todayOrders?.length || 0;
      
      // Encontrar produto mais vendido
      const productCounts: Record<string, number> = {};
      orderItems?.forEach(item => {
        const productName = item.product_name;
        if (!productCounts[productName]) {
          productCounts[productName] = 0;
        }
        productCounts[productName] += item.quantity;
      });
      
      let topProduct = "Nenhum";
      let maxCount = 0;
      
      Object.entries(productCounts).forEach(([product, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topProduct = product;
        }
      });
      
      return {
        totalSales,
        ordersToday,
        topProduct
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total de Vendas</CardTitle>
            <CardDescription>Vendas da semana atual</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando...</span>
              </div>
            ) : (
              <p className="text-3xl font-bold text-pdv-blue">
                R$ {stats.totalSales.toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Pedidos</CardTitle>
            <CardDescription>Total de pedidos hoje</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando...</span>
              </div>
            ) : (
              <p className="text-3xl font-bold text-pdv-green">{stats.ordersToday}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Produto mais vendido</CardTitle>
            <CardDescription>Nesta semana</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando...</span>
              </div>
            ) : (
              <p className="text-3xl font-bold text-pdv-orange">{stats.topProduct}</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Vendas por dia da semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {isLoadingSales ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-pdv-blue" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="vendas" fill="#0EA5E9" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Configurações e Integrações */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configurações e Integrações</CardTitle>
          <CardDescription>Configure impressoras e integrações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Configurações de Impressora */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Printer className="h-5 w-5 mr-2" />
                  Configurações de Impressão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-sm text-gray-500">Modelos de Impressora:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button variant="outline" size="sm">48mm</Button>
                  <Button variant="outline" size="sm">58mm</Button>
                  <Button variant="outline" size="sm">80mm</Button>
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => navigate("/admin/printer-settings")}
                >
                  Configurar Impressora
                </Button>
              </CardContent>
            </Card>
            
            {/* Integrações */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Integrações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-pdv-blue" />
                      <span>Stone Pagamentos</span>
                    </div>
                    <Button variant="outline" size="sm">Conectar</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Database className="h-5 w-5 mr-2 text-pdv-green" />
                      <span>Supabase</span>
                    </div>
                    <Button variant="outline" size="sm">Conectar</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Rocket className="h-5 w-5 mr-2 text-black" />
                      <span>Vercel</span>
                    </div>
                    <Button variant="outline" size="sm">Conectar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle>Acesso rápido</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button onClick={() => navigate("/admin/products")}>
              Gerenciar Produtos
            </Button>
            <Button onClick={() => navigate("/admin/categories")}>
              Gerenciar Categorias
            </Button>
            <Button onClick={() => navigate("/admin/reports")}>
              Relatórios de Vendas
            </Button>
            <Button onClick={() => navigate("/admin/printer-settings")}>
              Configurações de Impressão
            </Button>
            <Button onClick={() => navigate("/")}>
              Ir para PDV
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Admin;
