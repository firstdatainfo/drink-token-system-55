
import { useState } from "react";
import { Layout } from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, Filter } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const salesData = [
  { date: '01/05', vendas: 4000 },
  { date: '02/05', vendas: 3000 },
  { date: '03/05', vendas: 2000 },
  { date: '04/05', vendas: 2780 },
  { date: '05/05', vendas: 1890 },
  { date: '06/05', vendas: 2390 },
  { date: '07/05', vendas: 3490 },
];

const categoryData = [
  { name: 'Bebidas', value: 400 },
  { name: 'Alimentos', value: 300 },
  { name: 'Sobremesas', value: 300 },
  { name: 'Combos', value: 200 },
];

const salesByProduct = [
  { id: 1, product: 'Cerveja', quantity: 150, revenue: 750.00 },
  { id: 2, product: 'Água', quantity: 120, revenue: 360.00 },
  { id: 3, product: 'Refrigerante', quantity: 100, revenue: 400.00 },
  { id: 4, product: 'Suco', quantity: 80, revenue: 320.00 },
  { id: 5, product: 'Vinho', quantity: 30, revenue: 900.00 },
];

const Reports = () => {
  const [reportType, setReportType] = useState("sales");
  const [dateRange, setDateRange] = useState("week");

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Relatórios de Vendas</h1>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <Input id="startDate" type="date" />
                </div>
                
                <div>
                  <Label htmlFor="endDate">Data Final</Label>
                  <Input id="endDate" type="date" />
                </div>
              </>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button className="bg-pdv-blue hover:bg-pdv-blue/90">
              <Filter className="mr-2 h-4 w-4" /> Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {reportType === "sales" && (
        <Card className="mb-6">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle>Vendas Diárias</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Exportar
            </Button>
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
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="vendas" stroke="#0EA5E9" activeDot={{ r: 8 }} name="Vendas (R$)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
      
      {reportType === "categories" && (
        <Card className="mb-6">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle>Vendas por Categoria</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Exportar
            </Button>
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
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
      
      {reportType === "products" && (
        <Card className="mb-6">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle>Vendas por Produto</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Exportar
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Receita (R$)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesByProduct.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.revenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Vendas</p>
              <p className="text-2xl font-bold text-pdv-blue">R$ 3,650.00</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Itens Vendidos</p>
              <p className="text-2xl font-bold text-pdv-green">480</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
              <p className="text-2xl font-bold text-pdv-orange">R$ 42.50</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Reports;
