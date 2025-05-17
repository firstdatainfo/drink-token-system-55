
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/admin/Layout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Printer, CreditCard, Database, Rocket } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState([
    { name: "Segunda", vendas: 400 },
    { name: "Terça", vendas: 300 },
    { name: "Quarta", vendas: 500 },
    { name: "Quinta", vendas: 280 },
    { name: "Sexta", vendas: 590 },
    { name: "Sábado", vendas: 800 },
    { name: "Domingo", vendas: 700 },
  ]);

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
            <p className="text-3xl font-bold text-pdv-blue">R$ 3.570,00</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Pedidos</CardTitle>
            <CardDescription>Total de pedidos hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-pdv-green">42</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Produto mais vendido</CardTitle>
            <CardDescription>Nesta semana</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-pdv-orange">Cerveja</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Vendas por dia da semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
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
