
import { Layout } from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsSicredi() {
  const [loading, setLoading] = useState(false);
  
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      toast.success("Integração com Sicredi configurada com sucesso!");
    }, 1500);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Integração Sicredi</h1>
        <p className="text-gray-500">
          Configure sua integração bancária com o Sicredi
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>Configurar Sicredi</CardTitle>
            <CardDescription>
              Configure os parâmetros para a integração Sicredi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sicredi-client-id">Client ID</Label>
                <Input id="sicredi-client-id" placeholder="Digite o Client ID" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sicredi-client-secret">Client Secret</Label>
                <Input id="sicredi-client-secret" type="password" placeholder="Digite o Client Secret" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sicredi-agency">Agência</Label>
                <Input id="sicredi-agency" placeholder="Digite o número da agência" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sicredi-account">Conta</Label>
                <Input id="sicredi-account" placeholder="Digite o número da conta" />
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
