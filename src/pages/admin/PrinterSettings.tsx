import { useState } from "react";
import { Layout } from "@/components/admin/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Printer, Save, FileDown, QrCode, Barcode } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  showQRCode: boolean;
  showBarcode: boolean;
  securityCodeText: string;
  customHeader: string;
  customFooter: string;
  authorizationNumber: string;
  nsuNumber: string;
  validationCode: string;
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
      showQRCode: true,
      showBarcode: true,
      securityCodeText: "Código de segurança",
      customHeader: "FICHA DE PEDIDO",
      customFooter: "Obrigado pela preferência!",
      authorizationNumber: "",
      nsuNumber: "",
      validationCode: "",
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="showQRCode"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Mostrar QR Code
                                  </FormLabel>
                                  <FormDescription>
                                    Exibe um QR Code para validação do pedido
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
                            name="showBarcode"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Mostrar Código de Barras
                                  </FormLabel>
                                  <FormDescription>
                                    Exibe um código de barras na ficha
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FormField
                            control={form.control}
                            name="authorizationNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número de Autorização</FormLabel>
                                <FormControl>
                                  <Input placeholder="123456789" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="nsuNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número NSU</FormLabel>
                                <FormControl>
                                  <Input placeholder="000123" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="validationCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Código Validador</FormLabel>
                                <FormControl>
                                  <Input placeholder="ABC123" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="securityCodeText"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Texto do Código de Segurança</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                              <FormDescription>
                                Texto exibido acima do código de barras
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                        
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
                    
                    {/* Dados de validação */}
                    {(form.watch("authorizationNumber") || form.watch("nsuNumber") || form.watch("validationCode")) && (
                      <>
                        <div className="mt-2 mb-1">DADOS DE VALIDAÇÃO:</div>
                        {form.watch("authorizationNumber") && (
                          <div>AUT: {form.watch("authorizationNumber")}</div>
                        )}
                        {form.watch("nsuNumber") && (
                          <div>NSU: {form.watch("nsuNumber")}</div>
                        )}
                        {form.watch("validationCode") && (
                          <div>COD: {form.watch("validationCode")}</div>
                        )}
                        <div>--------------------------------</div>
                      </>
                    )}
                    
                    {form.watch("showQRCode") && (
                      <div className="mt-2 text-center">
                        <div className="flex justify-center mb-1">
                          <QrCode size={80} className="my-2" />
                        </div>
                        <div className="text-center text-xs mb-1">Escaneie o QR Code para validar</div>
                      </div>
                    )}
                    {form.watch("showBarcode") && (
                      <div className="mt-2 text-center">
                        <div className="text-center text-xs mb-1">{form.watch("securityCodeText")}</div>
                        <div className="flex justify-center">
                          <Barcode size={80} className="my-1" />
                        </div>
                      </div>
                    )}
                    <div className="text-center mt-2">{form.watch("customFooter")}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Visualizar detalhes da ficha
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Elementos da ficha</h4>
                        <p className="text-sm text-muted-foreground">
                          Elementos visíveis na ficha de impressão
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <div className="grid grid-cols-2 items-center gap-4">
                          <Label htmlFor="logoStatus">Logo:</Label>
                          <div id="logoStatus" className="font-medium">{form.watch("showLogo") ? "Visível" : "Oculto"}</div>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                          <Label htmlFor="orderNumStatus">Número do Pedido:</Label>
                          <div id="orderNumStatus" className="font-medium">{form.watch("showOrderNumber") ? "Visível" : "Oculto"}</div>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                          <Label htmlFor="qrStatus">QR Code:</Label>
                          <div id="qrStatus" className="font-medium">{form.watch("showQRCode") ? "Visível" : "Oculto"}</div>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                          <Label htmlFor="barcodeStatus">Código de Barras:</Label>
                          <div id="barcodeStatus" className="font-medium">{form.watch("showBarcode") ? "Visível" : "Oculto"}</div>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                          <Label htmlFor="validationData">Dados de Validação:</Label>
                          <div id="validationData" className="font-medium">
                            {(form.watch("authorizationNumber") || form.watch("nsuNumber") || form.watch("validationCode")) 
                              ? "Visível" : "Oculto"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PrinterSettings;
