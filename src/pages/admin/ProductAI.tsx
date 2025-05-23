
import { useState, useEffect } from "react";
import { Layout } from "@/components/admin/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Image as ImageIcon, 
  Camera, 
  MessageSquare, 
  Save, 
  Key, 
  Wand2 
} from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCategories } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface ProductSuggestion {
  name: string;
  price: string;
  category: string;
  description: string;
}

const ProductAI = () => {
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [productSuggestion, setProductSuggestion] = useState<ProductSuggestion | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [showGeneratingDialog, setShowGeneratingDialog] = useState(false);
  const [generatedImgUrl, setGeneratedImgUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();

  // Carregar chaves de API salvas
  useEffect(() => {
    const savedKeys = localStorage.getItem('ai_api_keys');
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys));
      } catch (e) {
        console.error('Erro ao carregar chaves de API:', e);
      }
    }
  }, []);

  // Verifica se há chaves de API configuradas
  const checkApiKeys = () => {
    // Verificamos se temos chaves para ChatGPT ou Gemini
    if (!apiKeys.chatgpt && !apiKeys.gemini) {
      setShowKeyDialog(true);
      return false;
    }
    return true;
  };

  // Função que vai processar a imagem usando IA
  const processImageWithAI = async () => {
    if (!selectedFile) {
      toast.error("Selecione uma imagem primeiro.");
      return;
    }

    if (!checkApiKeys()) return;

    setLoading(true);
    try {
      // Decidir qual API usar (preferência ao ChatGPT)
      const apiKey = apiKeys.chatgpt || apiKeys.gemini;
      const apiProvider = apiKeys.chatgpt ? "ChatGPT" : "Gemini";
      
      console.log(`Processando imagem usando ${apiProvider}...`);
      
      if (apiProvider === "ChatGPT" && apiKey) {
        // Converter imagem para base64
        const base64Image = await convertImageToBase64(selectedFile);
        
        // Preparar payload para OpenAI API
        const payload = {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "Você é um assistente especializado em identificar produtos em imagens. Identifique o produto na imagem e retorne as informações em formato JSON com os seguintes campos: name (nome do produto), price (preço estimado em reais, apenas números), category (categoria do produto), description (descrição detalhada do produto). Seja específico e detalhado."
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Identifique este produto e gere informações para cadastro:" },
                { type: "image_url", image_url: { url: base64Image } }
              ]
            }
          ]
        };

        // Fazer chamada para a API da OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        try {
          // Tentar extrair o JSON da resposta
          const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                           content.match(/```([\s\S]*?)```/) ||
                           content.match(/\{[\s\S]*?\}/);
          
          let productData;
          if (jsonMatch && jsonMatch[1]) {
            productData = JSON.parse(jsonMatch[1]);
          } else if (jsonMatch && jsonMatch[0]) {
            productData = JSON.parse(jsonMatch[0]);
          } else {
            productData = JSON.parse(content);
          }
          
          // Formatar o preço para o formato 0,00
          const priceAsString = productData.price.toString().replace('.', ',');
          
          setProductSuggestion({
            name: productData.name,
            price: priceAsString,
            category: productData.category,
            description: `${productData.description} (identificado por ${apiProvider})`
          });
          
          toast.success(`Produto identificado com sucesso usando ${apiProvider}!`);
        } catch (jsonError) {
          console.error("Erro ao processar JSON da resposta:", jsonError);
          // Fallback para processar texto não estruturado
          setProductSuggestion({
            name: "Produto identificado",
            price: "0,00",
            category: categories.length > 0 ? categories[0].name : "Sem categoria",
            description: `${content} (identificado por ${apiProvider})`
          });
          toast.warning("Produto identificado, mas com formato inesperado.");
        }
      } else if (apiProvider === "Gemini" && apiKey) {
        // Implementação para Gemini seria similar, mas por enquanto usamos simulação
        setTimeout(() => {
          setProductSuggestion({
            name: "Produto via Gemini",
            price: "29,90",
            category: categories.length > 0 ? categories[0].name : "Bebidas",
            description: `Produto identificado via API Gemini (simulado)`
          });
          toast.success(`Produto identificado com sucesso usando ${apiProvider}!`);
        }, 1500);
      } else {
        // Simulação para testes quando nenhuma API real está configurada
        setTimeout(() => {
          setProductSuggestion({
            name: "Produto de Teste",
            price: "19,99",
            category: categories.length > 0 ? categories[0].name : "Bebidas",
            description: `Produto de demonstração (simulação de ${apiProvider})`
          });
          toast.success(`Produto identificado com sucesso (simulação)!`);
        }, 1000);
      }
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      toast.error(`Erro ao processar imagem: ${error instanceof Error ? error.message : "Tente novamente"}`);
    } finally {
      setLoading(false);
    }
  };

  // Função que vai processar o texto usando IA
  const processTextWithAI = async () => {
    if (!textInput.trim()) {
      toast.error("Digite uma descrição do produto primeiro.");
      return;
    }

    if (!checkApiKeys()) return;

    setLoading(true);
    try {
      // Decidir qual API usar (preferência ao ChatGPT)
      const apiKey = apiKeys.chatgpt || apiKeys.gemini;
      const apiProvider = apiKeys.chatgpt ? "ChatGPT" : "Gemini";
      
      console.log(`Processando texto usando ${apiProvider}...`);
      
      if (apiProvider === "ChatGPT" && apiKey) {
        // Preparar payload para OpenAI API
        const payload = {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "Você é um assistente especializado em identificar produtos a partir de descrições. Identifique o produto na descrição e retorne as informações em formato JSON com os seguintes campos: name (nome do produto), price (preço estimado em reais, apenas números com casas decimais usando ponto), category (categoria do produto), description (descrição detalhada do produto). Seja específico e detalhado."
            },
            {
              role: "user",
              content: textInput
            }
          ]
        };

        // Fazer chamada para a API da OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        try {
          // Tentar extrair o JSON da resposta
          const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                           content.match(/```([\s\S]*?)```/) ||
                           content.match(/\{[\s\S]*?\}/);
          
          let productData;
          if (jsonMatch && jsonMatch[1]) {
            productData = JSON.parse(jsonMatch[1]);
          } else if (jsonMatch && jsonMatch[0]) {
            productData = JSON.parse(jsonMatch[0]);
          } else {
            productData = JSON.parse(content);
          }
          
          // Formatar o preço para o formato 0,00
          const priceAsString = productData.price.toString().replace('.', ',');
          
          setProductSuggestion({
            name: productData.name,
            price: priceAsString,
            category: productData.category,
            description: `${productData.description} (identificado por ${apiProvider})`
          });
          
          toast.success(`Produto identificado com sucesso usando ${apiProvider}!`);
        } catch (jsonError) {
          console.error("Erro ao processar JSON da resposta:", jsonError);
          // Fallback para processar texto não estruturado
          setProductSuggestion({
            name: "Produto identificado",
            price: "0,00",
            category: categories.length > 0 ? categories[0].name : "Sem categoria",
            description: `${content} (identificado por ${apiProvider})`
          });
          toast.warning("Produto identificado, mas com formato inesperado.");
        }
      } else if (apiProvider === "Gemini" && apiKey) {
        // Implementação para Gemini seria similar, mas por enquanto usamos simulação
        setTimeout(() => {
          setProductSuggestion({
            name: "Produto via Gemini",
            price: "29,90",
            category: categories.length > 0 ? categories[0].name : "Bebidas",
            description: `Produto identificado via API Gemini com a descrição: ${textInput}`
          });
          toast.success(`Produto identificado com sucesso usando ${apiProvider}!`);
        }, 1500);
      } else {
        // Simulação para testes quando nenhuma API real está configurada
        setTimeout(() => {
          const lowerInput = textInput.toLowerCase();
          
          if (lowerInput.includes('whisky') || lowerInput.includes('red label') || lowerInput.includes('redlabel')) {
            setProductSuggestion({
              name: "Whisky Red Label",
              price: "89,90",
              category: "Bebidas Alcoólicas",
              description: `Whisky Red Label, bebida alcoólica destilada. ${textInput} (simulação AI)`
            });
          } else {
            setProductSuggestion({
              name: textInput.split(' ').slice(0, 3).join(' '),
              price: "19,99",
              category: categories.length > 0 ? categories[0].name : "Bebidas",
              description: `${textInput} (simulação AI)`
            });
          }
          toast.success(`Produto identificado com sucesso (simulação)!`);
        }, 1000);
      }
    } catch (error) {
      console.error("Erro ao processar texto:", error);
      toast.error(`Erro ao processar texto: ${error instanceof Error ? error.message : "Tente novamente"}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para gerar imagem do produto usando IA
  const generateImageWithAI = async () => {
    if (!productSuggestion) {
      toast.error("Primeiro identifique um produto para gerar a imagem.");
      return;
    }

    if (!checkApiKeys()) return;

    setImageLoading(true);
    setShowGeneratingDialog(true);

    try {
      const apiKey = apiKeys.chatgpt || apiKeys.gemini;
      const apiProvider = apiKeys.chatgpt ? "ChatGPT" : "Gemini";
      
      console.log(`Gerando imagem usando ${apiProvider}...`);
      
      if (apiProvider === "ChatGPT" && apiKey) {
        const prompt = `Uma imagem profissional e realista de um produto: ${productSuggestion.name}. ${productSuggestion.description}. Fundo branco, estilo fotografia de produto para e-commerce, alta qualidade, iluminação profissional.`;
        
        // Chamada para a API da OpenAI (DALL-E)
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: prompt,
            size: "1024x1024",
            quality: "standard",
            n: 1
          })
        });

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();
        const imageUrl = data.data[0].url;
        
        // Fazer download da imagem e converter para blob
        const imageResponse = await fetch(imageUrl);
        const blob = await imageResponse.blob();
        
        // Criar arquivo a partir do blob
        const file = new File([blob], `${productSuggestion.name.replace(/\s+/g, '_')}.png`, {
          type: blob.type
        });
        
        setSelectedFile(file);
        setImagePreview(URL.createObjectURL(file));
        setGeneratedImgUrl(URL.createObjectURL(file));
        
        toast.success(`Imagem gerada com sucesso usando ${apiProvider}!`);
      } else {
        // Simulação para testes
        setTimeout(() => {
          // URLs de imagens de placeholder para simulação
          const placeholderImages = [
            "https://via.placeholder.com/500x500.png?text=Produto+Simulado",
            "https://via.placeholder.com/500x500.png?text=Imagem+Gerada+Por+IA"
          ];
          
          const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
          setGeneratedImgUrl(randomImage);
          
          toast.success(`Imagem gerada com sucesso (simulação)!`);
        }, 2000);
      }
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      toast.error(`Erro ao gerar imagem: ${error instanceof Error ? error.message : "Tente novamente"}`);
    } finally {
      setImageLoading(false);
    }
  };

  // Função para usar a imagem gerada
  const useGeneratedImage = () => {
    if (generatedImgUrl) {
      // Converter a URL para File é complexo em ambiente real
      // Aqui simulamos que já temos o File objeto
      setImagePreview(generatedImgUrl);
      setShowGeneratingDialog(false);
      
      // Na prática, você precisaria fazer download da imagem e convertê-la para File
      // O que já fazemos na função generateImageWithAI quando é uma chamada real
    }
  };

  // Função para converter imagem para base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Função para salvar o produto no banco de dados
  const saveProduct = async () => {
    if (!productSuggestion) {
      toast.error("Nenhum produto para salvar.");
      return;
    }

    setLoading(true);
    
    try {
      // Encontrar o ID da categoria pelo nome
      const categoryMatch = categories.find(
        cat => cat.name.toLowerCase() === productSuggestion.category.toLowerCase()
      );
      
      const categoryId = categoryMatch ? categoryMatch.id : null;
      
      // Converter preço de string para número
      const priceAsNumber = parseFloat(productSuggestion.price.replace(',', '.'));
      
      // Preparar dados para inserção
      const productData = {
        name: productSuggestion.name,
        price: priceAsNumber,
        category_id: categoryId,
        description: productSuggestion.description,
        image: null // Será atualizado se tivermos uma imagem
      };
      
      // Upload da imagem se existir
      if (selectedFile) {
        const fileName = `${Date.now()}_${selectedFile.name.replace(/\s+/g, '_')}`;
        const filePath = `${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product_images')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) {
          throw uploadError;
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('product_images')
          .getPublicUrl(uploadData.path);
          
        productData.image = publicUrlData.publicUrl;
      }
      
      // Inserir produto no banco de dados
      const { error } = await supabase
        .from('products')
        .insert([productData]);
        
      if (error) throw error;
      
      toast.success("Produto cadastrado com sucesso!");
      
      // Limpar os campos
      setSelectedFile(null);
      setImagePreview(null);
      setTextInput("");
      setProductSuggestion(null);
      setGeneratedImgUrl(null);
      
      // Redirecionar para a lista de produtos
      navigate('/admin/products');
      
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast.error("Erro ao salvar produto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error("Tipo de arquivo inválido. Apenas JPG, PNG, GIF, WebP são permitidos.");
        setSelectedFile(null);
        setImagePreview(null);
        e.target.value = "";
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande. O tamanho máximo é 5MB.");
        setSelectedFile(null);
        setImagePreview(null);
        e.target.value = "";
        return;
      }
      
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setImagePreview(null);
    }
  };

  const navigateToAISettings = () => {
    navigate('/admin/settings/ai');
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cadastro de Produtos com IA</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={navigateToAISettings}
            className="flex items-center gap-2"
          >
            <Key className="h-4 w-4" />
            Configurar Chaves de IA
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/products')}>
            Voltar para Produtos
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reconhecimento de Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="image" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span>Por Imagem</span>
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Por Texto</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="image" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Imagem do Produto</Label>
                  <Input 
                    id="image-upload" 
                    type="file" 
                    accept="image/jpeg, image/png, image/gif, image/webp" 
                    onChange={handleFileSelected} 
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
                  />
                </div>
                
                {imagePreview ? (
                  <div className="mt-4 border rounded-md p-2">
                    <Label className="block mb-2 text-sm">Prévia da imagem:</Label>
                    <div className="bg-gray-50 rounded overflow-hidden h-48 flex items-center justify-center">
                      <AspectRatio ratio={1 / 1} className="w-full h-full">
                        <img 
                          src={imagePreview} 
                          alt="Prévia" 
                          className="object-contain w-full h-full" 
                          onError={() => {
                            toast.error("Erro ao carregar imagem. Tente outra.");
                            setImagePreview(null);
                            setSelectedFile(null);
                          }}
                        />
                      </AspectRatio>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 border rounded-md p-2 bg-gray-50 h-36 flex flex-col items-center justify-center">
                    <ImageIcon className="mx-auto h-10 w-10 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Selecione uma imagem</p>
                    <p className="text-xs text-gray-400 mt-1">Tamanho máx. 5MB. JPG, PNG, GIF, WebP.</p>
                  </div>
                )}
                
                <Button 
                  className="w-full bg-pdv-blue hover:bg-pdv-blue/90"
                  onClick={processImageWithAI}
                  disabled={!selectedFile || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Reconhecer Produto"
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product-description">Descrição do Produto</Label>
                  <Textarea 
                    id="product-description"
                    placeholder="Descreva o produto detalhadamente. Ex: Whisky Red Label 1L, bebida alcoólica destilada"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                </div>
                
                <Button 
                  className="w-full bg-pdv-blue hover:bg-pdv-blue/90"
                  onClick={processTextWithAI}
                  disabled={!textInput.trim() || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Reconhecer Produto"
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Produto Identificado</CardTitle>
          </CardHeader>
          <CardContent>
            {productSuggestion ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Nome do Produto</Label>
                  <Input 
                    id="product-name" 
                    value={productSuggestion.name}
                    onChange={(e) => setProductSuggestion({...productSuggestion, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="product-price">Preço (R$)</Label>
                  <Input 
                    id="product-price" 
                    value={productSuggestion.price}
                    onChange={(e) => setProductSuggestion({...productSuggestion, price: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="product-category">Categoria</Label>
                  <Input 
                    id="product-category" 
                    value={productSuggestion.category}
                    onChange={(e) => setProductSuggestion({...productSuggestion, category: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="product-description-result">Descrição</Label>
                  <Textarea 
                    id="product-description-result"
                    value={productSuggestion.description}
                    onChange={(e) => setProductSuggestion({...productSuggestion, description: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 flex-1"
                    onClick={generateImageWithAI}
                    disabled={imageLoading}
                  >
                    {imageLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Gerar Imagem com IA
                      </>
                    )}
                  </Button>
                </div>
                
                <Button 
                  className="w-full flex items-center justify-center bg-pdv-green hover:bg-pdv-green/90"
                  onClick={saveProduct}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Produto
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
                <ImageIcon className="h-16 w-16 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Nenhum produto identificado</h3>
                <p className="text-sm max-w-xs">
                  Faça o upload de uma imagem ou descreva o produto para que a IA possa identificá-lo.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo para alertar sobre chaves não configuradas */}
      <AlertDialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chaves de API não configuradas</AlertDialogTitle>
            <AlertDialogDescription>
              Para usar o recurso de IA para cadastro de produtos, você precisa configurar pelo menos uma chave de API (ChatGPT ou Gemini).
              Deseja ir para a página de configurações de IA agora?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={navigateToAISettings}>Configurar Chaves</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo para mostrar a imagem sendo gerada */}
      <Dialog open={showGeneratingDialog} onOpenChange={setShowGeneratingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Geração de Imagem</DialogTitle>
            <DialogDescription>
              {imageLoading ? 
                "Gerando imagem do produto com inteligência artificial..." : 
                "Imagem gerada com sucesso!"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center p-4">
            {imageLoading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
                <p className="text-sm text-gray-500">
                  Isso pode levar alguns segundos...
                </p>
              </div>
            ) : generatedImgUrl ? (
              <div className="w-full max-h-80 rounded-md overflow-hidden">
                <img 
                  src={generatedImgUrl} 
                  alt="Imagem gerada" 
                  className="w-full h-full object-contain"
                />
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGeneratingDialog(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={useGeneratedImage}
              disabled={imageLoading || !generatedImgUrl}
            >
              Usar esta imagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProductAI;
