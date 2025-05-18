
import { Layout } from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { FileUp } from "lucide-react";

export default function SettingsFiscal() {
  const [loading, setLoading] = useState(false);
  
  const fiscalOptions = [
    { id: "nfce", name: "NFC-e" },
    { id: "nfe", name: "NF-e" },
    { id: "sat", name: "SAT Fiscal" },
    { id: "mfe", name: "MFE" },
  ];
  
  const handleSaveFiscal = () => {
    setLoading(true);
    
    // Simulação de integração
    setTimeout(() => {
      setLoading(false);
      toast.success("Configuração fiscal salva com sucesso!");
    }, 1500);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Emissores Fiscais</h1>
        <p className="text-gray-500">
          Configure os emissores fiscais para seu estabelecimento
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>Configurar Emissor Fiscal</CardTitle>
            <CardDescription>
              Escolha o modelo de emissor fiscal e configure seus parâmetros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fiscal-type">Tipo de Emissor</Label>
              <Select>
                <SelectTrigger id="fiscal-type">
                  <SelectValue placeholder="Selecione o emissor fiscal" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalOptions.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cert-file">Certificado Digital</Label>
              <div className="flex items-center gap-2">
                <Input id="cert-file" type="file" className="hidden" />
                <Button variant="outline" className="w-full" asChild>
                  <label htmlFor="cert-file" className="flex items-center justify-center cursor-pointer">
                    <FileUp className="mr-2 h-4 w-4" />
                    Selecionar Certificado
                  </label>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Selecione o certificado digital A1 em formato .pfx
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cert-password">Senha do Certificado</Label>
              <Input id="cert-password" type="password" placeholder="Digite a senha do certificado" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ do Emitente</Label>
              <Input id="cnpj" placeholder="00.000.000/0000-00" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ie">Inscrição Estadual</Label>
              <Input id="ie" placeholder="Digite a inscrição estadual" />
            </div>
            
            <div className="space-y-2">
              <Label>Ambiente</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input type="radio" id="production" name="environment" value="production" />
                  <Label htmlFor="production" className="cursor-pointer">Produção</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="radio" id="test" name="environment" value="test" checked />
                  <Label htmlFor="test" className="cursor-pointer">Homologação</Label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancelar</Button>
            <Button onClick={handleSaveFiscal} disabled={loading}>
              {loading ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
