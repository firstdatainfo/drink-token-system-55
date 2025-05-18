
import { Layout } from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsBancoBrasil() {
  const [loading, setLoading] = useState(false);
  
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      toast.success("Integração com Banco do Brasil configurada com sucesso!");
    }, 1500);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Integração Banco do Brasil</h1>
        <p className="text-gray-500">
          Configure sua integração bancária com o Banco do Brasil
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>Configurar Banco do Brasil</CardTitle>
            <CardDescription>
              Configure os parâmetros para a integração com o Banco do Brasil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bb-client-id">Client ID</Label>
                <Input id="bb-client-id" placeholder="Digite o Client ID" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bb-client-secret">Client Secret</Label>
                <Input id="bb-client-secret" type="password" placeholder="Digite o Client Secret" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bb-app-key">Application Key</Label>
                <Input id="bb-app-key" placeholder="Digite a chave da aplicação" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bb-agency">Agência</Label>
                <Input id="bb-agency" placeholder="Digite o número da agência" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bb-account">Conta</Label>
                <Input id="bb-account" placeholder="Digite o número da conta" />
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
