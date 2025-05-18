
import { Layout } from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsStone() {
  const [loading, setLoading] = useState(false);
  
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulação de integração
    setTimeout(() => {
      setLoading(false);
      toast.success("Integração com Stone configurada com sucesso!");
    }, 1500);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Integração Stone</h1>
        <p className="text-gray-500">
          Configure sua integração com a Stone para processamento de pagamentos
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>Configurar Stone</CardTitle>
            <CardDescription>
              Preencha as informações necessárias para ativar a integração com a Stone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="credentials">
              <TabsList className="mb-6">
                <TabsTrigger value="credentials">Credenciais</TabsTrigger>
                <TabsTrigger value="terminals">Terminais</TabsTrigger>
                <TabsTrigger value="settings">Configurações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="credentials">
                <form onSubmit={handleSaveConfig} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stone-key">Chave de API</Label>
                    <Input id="stone-key" placeholder="Digite sua chave de API Stone" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stone-token">Token de Acesso</Label>
                    <Input id="stone-token" placeholder="Digite seu token de acesso" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stone-merchant">ID do Estabelecimento</Label>
                    <Input id="stone-merchant" placeholder="Digite o ID do estabelecimento" />
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Salvando..." : "Salvar Configurações"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="terminals">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configure os terminais Stone que serão utilizados neste ponto de venda.
                  </p>
                  
                  <div className="border rounded-md p-4">
                    <p className="text-center text-muted-foreground">
                      Nenhum terminal configurado. Adicione um terminal para começar.
                    </p>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    Adicionar Terminal
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="settings">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Personalize as configurações de integração com a Stone.
                  </p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stone-timeout">Tempo limite de transação (segundos)</Label>
                    <Input id="stone-timeout" type="number" defaultValue={30} />
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <Button disabled={loading}>
                      {loading ? "Salvando..." : "Salvar Configurações"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
