import { useState, useEffect } from "react";
import { Layout } from "@/components/admin/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Printer, Save, FileDown, QrCode, Barcode, ChevronLeft, Upload, Building, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
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
interface CompanySettingsFormValues {
  name: string;
  address: string;
  phone: string;
  email: string;
  footerMessage: string;
}
const PrinterSettings = () => {
  const [selectedModel, setSelectedModel] = useState<PrinterModel>("58mm");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("default");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const navigate = useNavigate();
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
      validationCode: ""
    }
  });
  const companyForm = useForm<CompanySettingsFormValues>({
    defaultValues: {
      name: "Nome da Empresa",
      address: "Endereço da Empresa",
      phone: "(00) 00000-0000",
      email: "contato@empresa.com",
      footerMessage: "Obrigado pela preferência!"
    }
  });

  // Carregar configurações da impressora
  useEffect(() => {
    const loadPrinterSettings = async () => {
      setLoadingSettings(true);
      try {
        const {
          data,
          error
        } = await supabase.from('printer_settings').select('*').maybeSingle();
        if (error) throw error;
        if (data) {
          form.reset({
            printerName: data.printer_name,
            printerModel: data.printer_model as PrinterModel,
            printerIP: data.printer_ip || "192.168.1.100",
            numberOfCopies: data.number_of_copies || 1,
            templateType: "default",
            showLogo: data.show_logo || true,
            showOrderNumber: data.show_order_number || true,
            showQRCode: data.show_qr_code || true,
            showBarcode: data.show_barcode || true,
            securityCodeText: data.security_code_text || "Código de segurança",
            customHeader: data.custom_header || "FICHA DE PEDIDO",
            customFooter: data.custom_footer || "Obrigado pela preferência!",
            authorizationNumber: data.authorization_number || "",
            nsuNumber: data.nsu_number || "",
            validationCode: data.validation_code || ""
          });
          setSelectedModel(data.printer_model as PrinterModel);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      } finally {
        setLoadingSettings(false);
      }
    };
    const loadCompanySettings = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('company_settings').select('*').maybeSingle();
        if (error) throw error;
        if (data) {
          companyForm.reset({
            name: data.name,
            address: data.address || "",
            phone: data.phone || "",
            email: data.email || "",
            footerMessage: data.footer_message || "Obrigado pela preferência!"
          });
          setLogoUrl(data.logo_url || null);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
      }
    };
    loadPrinterSettings();
    loadCompanySettings();
  }, [form, companyForm]);
  const onSubmit = async (data: PrinterSettingsFormValues) => {
    try {
      const {
        error
      } = await supabase.from('printer_settings').upsert({
        id: 'default',
        // Usando um ID fixo para facilitar a atualização
        printer_name: data.printerName,
        printer_model: data.printerModel,
        printer_ip: data.printerIP,
        number_of_copies: data.numberOfCopies,
        show_logo: data.showLogo,
        show_order_number: data.showOrderNumber,
        show_qr_code: data.showQRCode,
        show_barcode: data.showBarcode,
        security_code_text: data.securityCodeText,
        custom_header: data.customHeader,
        custom_footer: data.customFooter,
        authorization_number: data.authorizationNumber,
        nsu_number: data.nsuNumber,
        validation_code: data.validationCode
      });
      if (error) throw error;
      toast.success("Configurações da impressora salvas com sucesso!");
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error("Erro ao salvar configurações da impressora.");
    }
  };
  const onCompanySubmit = async (data: CompanySettingsFormValues) => {
    try {
      const {
        error
      } = await supabase.from('company_settings').upsert({
        id: 'default',
        // Usando um ID fixo para facilitar a atualização
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        footer_message: data.footerMessage,
        logo_url: logoUrl
      });
      if (error) throw error;
      toast.success("Dados da empresa salvos com sucesso!");
    } catch (error) {
      console.error('Erro ao salvar dados da empresa:', error);
      toast.error("Erro ao salvar dados da empresa.");
    }
  };
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar tipo de arquivo
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast.error("Formato de arquivo não suportado. Use JPG, PNG ou GIF.");
      return;
    }

    // Verificar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Arquivo muito grande. O tamanho máximo é 2MB.");
      return;
    }
    setIsUploading(true);
    try {
      // Gerar um nome de arquivo único baseado em timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Fazer o upload para o bucket
      const {
        error: uploadError,
        data
      } = await supabase.storage.from('company_logos').upload(filePath, file);
      if (uploadError) throw uploadError;

      // Obter a URL pública do arquivo
      const {
        data: publicUrlData
      } = supabase.storage.from('company_logos').getPublicUrl(filePath);
      setLogoUrl(publicUrlData.publicUrl);
      toast.success("Logo carregado com sucesso!");
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error("Erro ao fazer upload do logo.");
    } finally {
      setIsUploading(false);
    }
  };
  const handleRemoveLogo = async () => {
    if (!logoUrl) return;
    try {
      // Extrair o nome do arquivo da URL
      const fileName = logoUrl.split('/').pop();
      if (!fileName) return;

      // Remover o arquivo do storage
      const {
        error
      } = await supabase.storage.from('company_logos').remove([fileName]);
      if (error) throw error;

      // Atualizar o registro da empresa para remover a referência ao logo
      await supabase.from('company_settings').upsert({
        id: 'default',
        logo_url: null
      });
      setLogoUrl(null);
      toast.success("Logo removido com sucesso!");
    } catch (error) {
      console.error('Erro ao remover logo:', error);
      toast.error("Erro ao remover o logo.");
    }
  };
  const testPrint = () => {
    toast.success("Impressão de teste enviada!");
  };
  const downloadTemplate = () => {
    // Simulação de download do modelo
    toast.success("Modelo de impressão baixado!");
  };
  return <Layout>
      <div className="flex items-center mb-6">
        
        <h1 className="text-2xl font-bold flex items-center">
          <Printer className="mr-2" /> 
          Configurações de Impressão
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="company">Dados da Empresa</TabsTrigger>
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
                        <FormField control={form.control} name="printerName" render={({
                        field
                      }) => <FormItem>
                              <FormLabel>Nome da Impressora</FormLabel>
                              <FormControl>
                                <Input placeholder="Impressora PDV" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>} />
                        
                        <FormField control={form.control} name="printerModel" render={({
                        field
                      }) => <FormItem>
                              <FormLabel>Modelo da Impressora</FormLabel>
                              <Select onValueChange={(value: PrinterModel) => {
                          field.onChange(value);
                          setSelectedModel(value);
                        }} defaultValue={field.value}>
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
                            </FormItem>} />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="printerIP" render={({
                        field
                      }) => <FormItem>
                              <FormLabel>IP da Impressora</FormLabel>
                              <FormControl>
                                <Input placeholder="192.168.1.100" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>} />
                        
                        <FormField control={form.control} name="numberOfCopies" render={({
                        field
                      }) => <FormItem>
                              <FormLabel>Número de Cópias</FormLabel>
                              <FormControl>
                                <Input type="number" min={1} max={5} {...field} onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>} />
                      </div>
                      
                      <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={testPrint}>
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
            
            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle>Dados da Empresa</CardTitle>
                  <CardDescription>Informações que serão exibidas na ficha de impressão</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...companyForm}>
                    <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex flex-col items-center p-4 border rounded-md">
                          <Label className="mb-2 font-semibold">Logo da Empresa</Label>
                          {logoUrl ? <div className="flex flex-col items-center gap-4">
                              <img src={logoUrl} alt="Logo da empresa" className="max-w-[200px] max-h-[100px] object-contain mb-2" />
                              <Button type="button" variant="destructive" size="sm" onClick={handleRemoveLogo}>
                                <Trash2 className="h-4 w-4 mr-2" /> Remover Logo
                              </Button>
                            </div> : <div className="flex flex-col items-center">
                              <Building className="h-16 w-16 text-gray-300 mb-2" />
                              <p className="text-sm text-gray-500 mb-4">Nenhum logo carregado</p>
                              <Label htmlFor="logo-upload" className="cursor-pointer bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                {isUploading ? "Carregando..." : "Carregar Logo"}
                              </Label>
                              <Input id="logo-upload" type="file" accept="image/png,image/jpeg,image/gif" className="hidden" onChange={handleLogoUpload} disabled={isUploading} />
                            </div>}
                        </div>
                      
                        <FormField control={companyForm.control} name="name" render={({
                        field
                      }) => <FormItem>
                              <FormLabel>Nome da Empresa</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>} />
                        
                        <FormField control={companyForm.control} name="address" render={({
                        field
                      }) => <FormItem>
                              <FormLabel>Endereço</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField control={companyForm.control} name="phone" render={({
                          field
                        }) => <FormItem>
                                <FormLabel>Telefone</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>} />
                          
                          <FormField control={companyForm.control} name="email" render={({
                          field
                        }) => <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>} />
                        </div>
                        
                        <FormField control={companyForm.control} name="footerMessage" render={({
                        field
                      }) => <FormItem>
                              <FormLabel>Mensagem de Rodapé</FormLabel>
                              <FormControl>
                                <Textarea {...field} rows={3} placeholder="Mensagem que aparecerá no rodapé da ficha" />
                              </FormControl>
                              <FormDescription>
                                Esta mensagem será exibida no final da ficha de impressão.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>} />
                      </div>
                      
                      <Button type="submit" className="w-full">
                        <Save className="mr-2 h-4 w-4" /> Salvar Dados da Empresa
                      </Button>
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
                        <FormField control={form.control} name="templateType" render={({
                        field
                      }) => <FormItem>
                              <FormLabel>Tipo de Modelo</FormLabel>
                              <Select onValueChange={(value: TemplateType) => {
                          field.onChange(value);
                          setSelectedTemplate(value);
                        }} defaultValue={field.value}>
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
                            </FormItem>} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="showLogo" render={({
                          field
                        }) => <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Mostrar Logo
                                  </FormLabel>
                                  <FormDescription>
                                    Exibe o logo da empresa na ficha
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>} />
                          
                          <FormField control={form.control} name="showOrderNumber" render={({
                          field
                        }) => <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Mostrar Número do Pedido
                                  </FormLabel>
                                  <FormDescription>
                                    Exibe o número do pedido na ficha
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="showQRCode" render={({
                          field
                        }) => <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Mostrar QR Code
                                  </FormLabel>
                                  <FormDescription>
                                    Exibe um QR Code para validação do pedido
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>} />
                          
                          <FormField control={form.control} name="showBarcode" render={({
                          field
                        }) => <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Mostrar Código de Barras
                                  </FormLabel>
                                  <FormDescription>
                                    Exibe um código de barras na ficha
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FormField control={form.control} name="authorizationNumber" render={({
                          field
                        }) => <FormItem>
                                <FormLabel>Número de Autorização</FormLabel>
                                <FormControl>
                                  <Input placeholder="123456789" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>} />
                          
                          <FormField control={form.control} name="nsuNumber" render={({
                          field
                        }) => <FormItem>
                                <FormLabel>Número NSU</FormLabel>
                                <FormControl>
                                  <Input placeholder="000123" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>} />
                          
                          <FormField control={form.control} name="validationCode" render={({
                          field
                        }) => <FormItem>
                                <FormLabel>Código Validador</FormLabel>
                                <FormControl>
                                  <Input placeholder="ABC123" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>} />
                        </div>

                        <FormField control={form.control} name="securityCodeText" render={({
                        field
                      }) => <FormItem>
                              <FormLabel>Texto do Código de Segurança</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                              <FormDescription>
                                Texto exibido acima do código de barras
                              </FormDescription>
                            </FormItem>} />
                        
                        <FormField control={form.control} name="customHeader" render={({
                        field
                      }) => <FormItem>
                              <FormLabel>Cabeçalho Personalizado</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>} />
                        
                        <FormField control={form.control} name="customFooter" render={({
                        field
                      }) => <FormItem>
                              <FormLabel>Rodapé Personalizado</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>} />
                      </div>
                      
                      <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={downloadTemplate}>
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
                <div className={`bg-white border border-gray-300 p-4 ${selectedModel === "48mm" ? "w-48" : selectedModel === "58mm" ? "w-56" : "w-72"}`}>
                  {form.watch("showLogo") && logoUrl && <div className="flex justify-center mb-2">
                      <img src={logoUrl} alt="Logo da empresa" className="max-w-[90%] max-h-[50px] object-contain" />
                    </div>}
                  <div className="text-center font-bold mb-2">{form.watch("customHeader")}</div>
                  <div className="text-center text-xs mb-2">{companyForm.watch("name") || "NOME DA EMPRESA"}</div>
                  <div className="text-xs">
                    <div>--------------------------------</div>
                    <div className="font-bold">PEDIDO #0001</div>
                    <div>--------------------------------</div>
                    <div className="font-bold mt-2">CLIENTE: Cliente da Silva</div>
                    <div className="mt-1">DATA: {new Date().toLocaleDateString('pt-BR')}</div>
                    <div className="mb-2">HORA: {new Date().toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</div>
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
                    {(form.watch("authorizationNumber") || form.watch("nsuNumber") || form.watch("validationCode")) && <>
                        <div className="mt-2 mb-1">DADOS DE VALIDAÇÃO:</div>
                        {form.watch("authorizationNumber") && <div>AUT: {form.watch("authorizationNumber")}</div>}
                        {form.watch("nsuNumber") && <div>NSU: {form.watch("nsuNumber")}</div>}
                        {form.watch("validationCode") && <div>COD: {form.watch("validationCode")}</div>}
                        <div>--------------------------------</div>
                      </>}
                    
                    {form.watch("showQRCode") && <div className="mt-2 text-center">
                        <div className="flex justify-center mb-1">
                          <QrCode size={80} className="my-2" />
                        </div>
                        <div className="text-center text-xs mb-1">Escaneie o QR Code para validar</div>
                      </div>}
                    {form.watch("showBarcode") && <div className="mt-2 text-center">
                        <div className="text-center text-xs mb-1">{form.watch("securityCodeText")}</div>
                        <div className="flex justify-center">
                          <Barcode size={80} className="my-1" />
                        </div>
                      </div>}
                    <div className="text-center mt-2">{companyForm.watch("footerMessage")}</div>
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
                            {form.watch("authorizationNumber") || form.watch("nsuNumber") || form.watch("validationCode") ? "Visível" : "Oculto"}
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
    </Layout>;
};
export default PrinterSettings;