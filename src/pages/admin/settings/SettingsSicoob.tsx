
import { Layout } from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsSicoob() {
  const [loading, setLoading] = useState(false);
  
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      toast.success("Integração com Sicoob configurada com sucesso!");
    }, 1500);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Integração Sicoob</h1>
        <p className="text-gray-500">
          Configure sua integração bancária com o Sicoob
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>Configurar Sicoob</CardTitle>
            <CardDescription>
              Configure os parâmetros para a integração Sicoob
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sicoob-client-id">Client ID</Label>
                <Input id="sicoob-client-id" placeholder="Digite o Client ID" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sicoob-client-secret">Client Secret</Label>
                <Input id="sicoob-client-secret" type="password" placeholder="Digite o Client Secret" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sicoob-agency">Agência</Label>
                <Input id="sicoob-agency" placeholder="Digite o número da agência" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sicoob-account">Conta</Label>
                <Input id="sicoob-account" placeholder="Digite o número da conta" />
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
