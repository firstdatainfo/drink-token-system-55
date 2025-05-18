
import { Layout } from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsMercadoPago() {
  const [loading, setLoading] = useState(false);
  
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      toast.success("Integração com Mercado Pago configurada com sucesso!");
    }, 1500);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Integração Mercado Pago</h1>
        <p className="text-gray-500">
          Configure sua integração com o Mercado Pago para processamento de pagamentos
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>Configurar Mercado Pago</CardTitle>
            <CardDescription>
              Preencha as credenciais para ativar a integração
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mp-access-token">Access Token</Label>
                <Input id="mp-access-token" placeholder="Digite seu Access Token do Mercado Pago" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mp-public-key">Public Key</Label>
                <Input id="mp-public-key" placeholder="Digite sua Public Key" />
              </div>
              
              <div className="flex items-center justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
