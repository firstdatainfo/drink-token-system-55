
import { Layout } from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsEFI() {
  const [loading, setLoading] = useState(false);
  
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      toast.success("Integração com EFI configurada com sucesso!");
    }, 1500);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Integração EFI</h1>
        <p className="text-gray-500">
          Configure sua integração com o EFI para pagamentos e transações
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>Configurar EFI</CardTitle>
            <CardDescription>
              Configure os parâmetros para a integração EFI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="efi-key">Chave de Integração</Label>
                <Input id="efi-key" placeholder="Digite sua chave de integração EFI" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="efi-merchant">ID do Comerciante</Label>
                <Input id="efi-merchant" placeholder="Digite o ID do comerciante" />
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
