
import { useState } from "react";
import { Layout } from "@/components/admin/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Printer, Save } from "lucide-react";
import { toast } from "sonner";

type PrinterModel = "48mm" | "58mm" | "80mm";

interface PrinterSettingsFormValues {
  printerName: string;
  printerModel: PrinterModel;
  printerIP: string;
  numberOfCopies: number;
}

const PrinterSettings = () => {
  const [selectedModel, setSelectedModel] = useState<PrinterModel>("58mm");
  
  const form = useForm<PrinterSettingsFormValues>({
    defaultValues: {
      printerName: "Impressora PDV",
      printerModel: "58mm",
      printerIP: "192.168.1.100",
      numberOfCopies: 1,
    },
  });

  const onSubmit = (data: PrinterSettingsFormValues) => {
    console.log("Printer settings:", data);
    toast.success("Configurações da impressora salvas com sucesso!");
  };

  const testPrint = () => {
    toast.success("Impressão de teste enviada!");
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Printer className="mr-2" /> 
        Configurações de Impressão
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Impressora</CardTitle>
              <CardDescription>
                Configure os detalhes da sua impressora térmica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="printerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Impressora</FormLabel>
                          <FormControl>
                            <Input placeholder="Impressora PDV" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="printerModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo da Impressora</FormLabel>
                          <Select 
                            onValueChange={(value: PrinterModel) => {
                              field.onChange(value);
                              setSelectedModel(value);
                            }} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o modelo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="48mm">48mm</SelectItem>
                              <SelectItem value="58mm">58mm</SelectItem>
                              <SelectItem value="80mm">80mm</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="printerIP"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IP da Impressora</FormLabel>
                          <FormControl>
                            <Input placeholder="192.168.1.100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="numberOfCopies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Cópias</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              max={5} 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={testPrint}
                    >
                      Imprimir Teste
                    </Button>
                    
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" /> Salvar Configurações
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Modelo de Impressão</CardTitle>
              <CardDescription>Visualização baseada no modelo selecionado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div 
                  className={`bg-white border border-gray-300 p-4 ${
                    selectedModel === "48mm" ? "w-48" : 
                    selectedModel === "58mm" ? "w-56" : "w-72"
                  }`}
                >
                  <div className="text-center font-bold mb-2">NOME DA EMPRESA</div>
                  <div className="text-center text-xs mb-4">CNPJ: 00.000.000/0000-00</div>
                  <div className="text-xs mb-4">
                    <div>--------------------------------</div>
                    <div>CUPOM NÃO FISCAL</div>
                    <div>--------------------------------</div>
                    <div>Item 1................... R$ 10,00</div>
                    <div>Item 2................... R$ 15,00</div>
                    <div>--------------------------------</div>
                    <div>TOTAL................... R$ 25,00</div>
                    <div>DINHEIRO................ R$ 50,00</div>
                    <div>TROCO................... R$ 25,00</div>
                    <div>--------------------------------</div>
                    <div className="text-center mt-2">
                      {new Date().toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-center">
                      {new Date().toLocaleTimeString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PrinterSettings;
