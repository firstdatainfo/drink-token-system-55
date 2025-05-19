
import { useState, useEffect } from "react";
import { Layout } from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Filter, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExportOptions } from "@/components/admin/ExportOptions";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Reports = () => {
  const [reportType, setReportType] = useState("sales");
  const [dateRange, setDateRange] = useState("week");
  const [startDate, setStartDate] = useState(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState(new Date());
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Function to set date range based on selection
  useEffect(() => {
    switch (dateRange) {
      case "today":
        setStartDate(startOfDay(new Date()));
        setEndDate(new Date());
        break;
      case "week":
        setStartDate(subDays(new Date(), 7));
        setEndDate(new Date());
        break;
      case "month":
        setStartDate(subDays(new Date(), 30));
        setEndDate(new Date());
        break;
      // For custom dates, don't change the state here
    }
  }, [dateRange]);

  // Query to fetch sales data from Supabase
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-data', startDate, endDate],
    queryFn: async () => {
      try {
        const startDateIso = startOfDay(startDate).toISOString();
        const endDateIso = endOfDay(endDate).toISOString();
        
        const { data: orders, error } = await supabase
          .from('orders')
          .select('id, created_at, total_amount, status')
          .gte('created_at', startDateIso)
          .lte('created_at', endDateIso)
          .order('created_at');
          
        if (error) throw error;
        
        // Group by date for chart visualization
        const salesByDate = orders.reduce((acc: Record<string, number>, order) => {
          const date = format(new Date(order.created_at), 'dd/MM');
          acc[date] = (acc[date] || 0) + Number(order.total_amount);
          return acc;
        }, {});
        
        const formattedData = Object.entries(salesByDate).map(([date, vendas]) => ({
          date,
          vendas
        }));
        
        return formattedData;
      } catch (error) {
        console.error("Erro ao buscar dados de vendas:", error);
        toast.error("Falha ao carregar dados de vendas");
        return [];
      }
    },
    enabled: reportType === "sales"
  });

  // Query to fetch category data from Supabase
  const { data: categoryData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['category-data', startDate, endDate],
    queryFn: async () => {
      try {
        const startDateIso = startOfDay(startDate).toISOString();
        const endDateIso = endOfDay(endDate).toISOString();
        
        // Join orders, order_items, products, and categories to get sales by category
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            order_items!inner(
              product_id,
              quantity,
              subtotal,
              products:product_id(
                category_id,
                categories:category_id(name)
              )
            )
          `)
          .gte('created_at', startDateIso)
          .lte('created_at', endDateIso)
          .eq('status', 'completed');
          
        if (error) throw error;
        
        // Process data to get sales by category
        const categorySales = data.flatMap(order => 
          order.order_items.map(item => ({
            categoryName: item.products?.categories?.name || 'Sem categoria',
            value: Number(item.subtotal)
          }))
        ).reduce((acc: Record<string, number>, item) => {
          acc[item.categoryName] = (acc[item.categoryName] || 0) + item.value;
          return acc;
        }, {});
        
        const formattedData = Object.entries(categorySales).map(([name, value]) => ({
          name,
          value
        }));
        
        return formattedData.length > 0 ? formattedData : [
          { name: 'Sem dados', value: 1 }
        ];
      } catch (error) {
        console.error("Erro ao buscar dados por categoria:", error);
        toast.error("Falha ao carregar dados por categoria");
        return [{ name: 'Sem dados', value: 1 }];
      }
    },
    enabled: reportType === "categories"
  });

  // Query to fetch product sales data from Supabase
  const { data: productData, isLoading: productsLoading } = useQuery({
    queryKey: ['product-data', startDate, endDate],
    queryFn: async () => {
      try {
        const startDateIso = startOfDay(startDate).toISOString();
        const endDateIso = endOfDay(endDate).toISOString();
        
        // Get sales by product
        const { data, error } = await supabase
          .from('order_items')
          .select(`
            id,
            product_name,
            quantity,
            product_price,
            subtotal,
            orders!inner(created_at, status)
          `)
          .gte('orders.created_at', startDateIso)
          .lte('orders.created_at', endDateIso)
          .eq('orders.status', 'completed');
          
        if (error) throw error;
        
        // Aggregate by product
        const productSales = data.reduce((acc: Record<string, any>, item) => {
          const key = item.product_name;
          
          if (!acc[key]) {
            acc[key] = {
              product: key,
              quantity: 0,
              revenue: 0
            };
          }
          
          acc[key].quantity += Number(item.quantity);
          acc[key].revenue += Number(item.subtotal);
          return acc;
        }, {});
        
        // Convert to array and sort by revenue
        const formattedData = Object.values(productSales)
          .sort((a: any, b: any) => b.revenue - a.revenue)
          .map((item: any, index) => ({
            id: index + 1,
            ...item
          }));
          
        return formattedData;
      } catch (error) {
        console.error("Erro ao buscar dados por produto:", error);
        toast.error("Falha ao carregar dados por produto");
        return [];
      }
    },
    enabled: reportType === "products"
  });

  // Calculate summary values
  const summary = {
    totalSales: 0,
    totalItems: 0,
    averageTicket: 0
  };

  if (productData && productData.length > 0) {
    summary.totalSales = productData.reduce((sum: number, product: any) => sum + product.revenue, 0);
    summary.totalItems = productData.reduce((sum: number, product: any) => sum + product.quantity, 0);
    summary.averageTicket = summary.totalItems > 0 ? summary.totalSales / summary.totalItems : 0;
  }

  // Handle applying filters
  const handleApplyFilters = () => {
    setIsFilterOpen(false);
    // The useEffect will handle date changes based on dateRange
  };

  // Determine if loading
  const isLoading = salesLoading || categoriesLoading || productsLoading;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Relatórios de Vendas</h1>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>Filtros</span>
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" /> Filtros Avançados
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Filtros de Relatório</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure os filtros para o relatório
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reportType">Tipo de Relatório</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger id="reportType">
                        <SelectValue placeholder="Tipo de Relatório" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Vendas por Dia</SelectItem>
                        <SelectItem value="categories">Vendas por Categoria</SelectItem>
                        <SelectItem value="products">Vendas por Produto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dateRange">Período</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger id="dateRange">
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Hoje</SelectItem>
                        <SelectItem value="week">Esta Semana</SelectItem>
                        <SelectItem value="month">Este Mês</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {dateRange === "custom" && (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="startDate">Data Inicial</Label>
                        <Input 
                          id="startDate" 
                          type="date" 
                          value={format(startDate, 'yyyy-MM-dd')}
                          onChange={(e) => setStartDate(new Date(e.target.value))}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="endDate">Data Final</Label>
                        <Input 
                          id="endDate" 
                          type="date"
                          value={format(endDate, 'yyyy-MM-dd')}
                          onChange={(e) => setEndDate(new Date(e.target.value))}
                        />
                      </div>
                    </>
                  )}
                  <Button onClick={handleApplyFilters}>Aplicar Filtros</Button>
                </div>
              </PopoverContent>
            </Popover>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="reportType">Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de Relatório" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Vendas por Dia</SelectItem>
                  <SelectItem value="categories">Vendas por Categoria</SelectItem>
                  <SelectItem value="products">Vendas por Produto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dateRange">Período</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {dateRange === "custom" && (
              <>
                <div>
                  <Label htmlFor="startDate">Data Inicial</Label>
                  <Input 
                    id="startDate" 
                    type="date" 
                    value={format(startDate, 'yyyy-MM-dd')}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                  />
                </div>
              </>
            )}
          </div>
          
          {dateRange === "custom" && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="endDate">Data Final</Label>
                <Input 
                  id="endDate" 
                  type="date"
                  value={format(endDate, 'yyyy-MM-dd')}
                  onChange={(e) => setEndDate(new Date(e.target.value))}
                />
              </div>
              <div className="col-span-2"></div>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleApplyFilters}
            >
              <Filter className="mr-2 h-4 w-4" /> Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <Card className="mb-6">
          <CardContent className="p-10 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </CardContent>
        </Card>
      ) : (
        <>
          {reportType === "sales" && salesData && (
            <Card className="mb-6">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle>Vendas Diárias</CardTitle>
                <ExportOptions exportData={salesData} filename="vendas_diarias" />
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={salesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${value}`, 'Vendas']} />
                      <Legend />
                      <Line type="monotone" dataKey="vendas" stroke="#0EA5E9" activeDot={{ r: 8 }} name="Vendas (R$)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
          
          {reportType === "categories" && categoryData && (
            <Card className="mb-6">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle>Vendas por Categoria</CardTitle>
                <ExportOptions exportData={categoryData} filename="vendas_por_categoria" />
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
          
          {reportType === "products" && productData && (
            <Card className="mb-6">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle>Vendas por Produto</CardTitle>
                <ExportOptions exportData={productData} filename="vendas_por_produto" />
              </CardHeader>
              <CardContent>
                {productData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                        <TableHead className="text-right">Receita (R$)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productData.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{item.revenue.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhuma venda por produto encontrada no período.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Vendas</p>
              <p className="text-2xl font-bold text-blue-600">R$ {summary.totalSales.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Itens Vendidos</p>
              <p className="text-2xl font-bold text-green-600">{summary.totalItems}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
              <p className="text-2xl font-bold text-orange-600">R$ {summary.averageTicket.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Reports;
