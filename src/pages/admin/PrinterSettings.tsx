import { useState } from "react";
import { Layout } from "@/components/admin/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Printer, Save, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

type PrinterModel = "48mm" | "58mm" | "80mm";
type TemplateType = "default" | "custom";

interface PrinterSettingsFormValues {
  printerName: string;
  printerModel: PrinterModel;
  printerIP: string;
  numberOfCopies: number;
  templateType: TemplateType;
  showLogo: boolean;
  showOrderNumber: boolean;
  customHeader: string;
  customFooter: string;
}

const PrinterSettings = () => {
  const [selectedModel, setSelectedModel] = useState<PrinterModel>("58mm");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("default");
  
  const form = useForm<PrinterSettingsFormValues>({
    defaultValues: {
      printerName: "Impressora PDV",
      printerModel: "58mm",
      printerIP: "192.168.1.100",
      numberOfCopies: 1,
      templateType: "default",
      showLogo: true,
      showOrderNumber: true,
      customHeader: "FICHA DE PEDIDO",
      customFooter: "Obrigado pela preferência!",
    },
  });

  const onSubmit = (data: PrinterSettingsFormValues) => {
    console.log("Printer settings:", data);
    toast.success("Configurações da impressora salvas com sucesso!");
  };

  const testPrint = () => {
    toast.success("Impressão de teste enviada!");
  };
  
  const downloadTemplate = () => {
    // Simulação de download do modelo
    toast.success("Modelo de impressão baixado!");
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Printer className="mr-2" /> 
        Configurações de Impressão
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="template">Modelo de Ficha</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
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
            </TabsContent>
            
            <TabsContent value="template">
              <Card>
                <CardHeader>
                  <CardTitle>Configuração do Modelo de Ficha</CardTitle>
                  <CardDescription>Personalize o modelo de impressão da ficha de pedido</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        <FormField
                          control={form.control}
                          name="templateType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Modelo</FormLabel>
                              <Select 
                                onValueChange={(value: TemplateType) => {
                                  field.onChange(value);
                                  setSelectedTemplate(value);
                                }} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo de modelo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="default">Modelo Padrão</SelectItem>
                                  <SelectItem value="custom">Modelo Personalizado</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="showLogo"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Mostrar Logo
                                  </FormLabel>
                                  <FormDescription>
                                    Exibe o logo da empresa na ficha
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="showOrderNumber"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Mostrar Número do Pedido
                                  </FormLabel>
                                  <FormDescription>
                                    Exibe o número do pedido na ficha
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="customHeader"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cabeçalho Personalizado</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="customFooter"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rodapé Personalizado</FormLabel>
                              <FormControl>
                                <Input {...field} />
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
                          onClick={downloadTemplate}
                        >
                          <FileDown className="mr-2 h-4 w-4" /> Baixar Modelo
                        </Button>
                        
                        <Button type="submit">
                          <Save className="mr-2 h-4 w-4" /> Salvar Configurações
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Modelo de Impressão</CardTitle>
              <CardDescription>Visualização da Ficha de Pedido</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div 
                  className={`bg-white border border-gray-300 p-4 ${
                    selectedModel === "48mm" ? "w-48" : 
                    selectedModel === "58mm" ? "w-56" : "w-72"
                  }`}
                >
                  <div className="text-center font-bold mb-2">FICHA DE PEDIDO</div>
                  <div className="text-center text-xs mb-2">NOME DA EMPRESA</div>
                  <div className="text-xs">
                    <div>--------------------------------</div>
                    <div className="font-bold">PEDIDO #0001</div>
                    <div>--------------------------------</div>
                    <div className="font-bold mt-2">CLIENTE: Cliente da Silva</div>
                    <div className="mt-1">DATA: {new Date().toLocaleDateString('pt-BR')}</div>
                    <div className="mb-2">HORA: {new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</div>
                    <div>--------------------------------</div>
                    <div className="font-bold mt-2">ITENS:</div>
                    <div>1x Ficha - R$10,00</div>
                    <div>2x Ficha Premium - R$30,00</div>
                    <div>--------------------------------</div>
                    <div className="font-bold">TOTAL: R$ 40,00</div>
                    <div>FORMA PGTO: Dinheiro</div>
                    <div>RECEBIDO: R$ 50,00</div>
                    <div>TROCO: R$ 10,00</div>
                    <div>--------------------------------</div>
                    <div className="text-center mt-2">Obrigado pela preferência!</div>
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
