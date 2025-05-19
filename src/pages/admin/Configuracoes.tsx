
import { useState } from "react";
import { Layout } from "@/components/admin/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, CreditCard, Database, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const Configuracoes = () => {
  const [selectedModel, setSelectedModel] = useState<string>("58mm");
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-2">Configurações e Integrações</h1>
        <p className="text-slate-500 mb-6">Configure impressoras e integrações</p>

        <div className="grid gap-6">
          {/* Configurações de Impressão */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Printer className="size-5" />
                Configurações de Impressão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-2">Modelos de Impressora:</p>
                  <ToggleGroup 
                    type="single" 
                    value={selectedModel}
                    onValueChange={(value) => {
                      if (value) setSelectedModel(value);
                    }}
                    className="flex gap-2"
                  >
                    <ToggleGroupItem 
                      value="48mm" 
                      className="border rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      48mm
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="58mm" 
                      className="border rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      58mm
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="80mm" 
                      className="border rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      80mm
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <Button 
                  variant="secondary" 
                  className="w-full bg-slate-50 hover:bg-slate-100"
                  onClick={() => navigate("/admin/printer-settings")}
                >
                  Configurar Impressora
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Integrações */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Integrações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="text-blue-500 size-5" />
                    <span>Stone Pagamentos</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate("/admin/settings/stone")}
                  >
                    Conectar
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="text-green-500 size-5" />
                    <span>Supabase</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    Conectar
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="text-purple-500 size-5" />
                    <span>Vercel</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    Conectar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Configuracoes;
