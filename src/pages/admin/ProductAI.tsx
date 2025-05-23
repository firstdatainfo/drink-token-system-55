
import { useState } from "react";
import { Layout } from "@/components/admin/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Loader2, Image as ImageIcon, Camera, MessageSquare, Save } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCategories } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";

interface ProductSuggestion {
  name: string;
  price: string;
  category: string;
  description: string;
}

const ProductAI = () => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [productSuggestion, setProductSuggestion] = useState<ProductSuggestion | null>(null);
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();

  // Função que vai processar a imagem usando IA
  const processImageWithAI = async () => {
    if (!selectedFile) {
      toast.error("Selecione uma imagem primeiro.");
      return;
    }

    setLoading(true);
    try {
      // Aqui você implementaria a chamada para uma API de reconhecimento de imagem
      // Estamos simulando um resultado
      setTimeout(() => {
        // Simulando resposta da IA
        setProductSuggestion({
          name: "Refrigerante Cola",
          price: "4,50",
          category: categories.length > 0 ? categories[0].name : "Bebidas",
          description: "Refrigerante sabor cola, garrafa 350ml"
        });
        setLoading(false);
        toast.success("Produto identificado com sucesso!");
      }, 2000);
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      toast.error("Erro ao processar imagem. Tente novamente.");
      setLoading(false);
    }
  };

  // Função que vai processar o texto usando IA
  const processTextWithAI = async () => {
    if (!textInput.trim()) {
      toast.error("Digite uma descrição do produto primeiro.");
      return;
    }

    setLoading(true);
    try {
      // Aqui você implementaria a chamada para uma API de processamento de texto
      // Estamos simulando um resultado
      setTimeout(() => {
        // Simulando resposta da IA
        setProductSuggestion({
          name: "Água Mineral",
          price: "2,00",
          category: categories.length > 0 ? categories[0].name : "Bebidas",
          description: "Água mineral sem gás, garrafa 500ml"
        });
        setLoading(false);
        toast.success("Produto identificado com sucesso!");
      }, 1500);
    } catch (error) {
      console.error("Erro ao processar texto:", error);
      toast.error("Erro ao processar texto. Tente novamente.");
      setLoading(false);
    }
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

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cadastro de Produtos com IA</h1>
        <Button variant="outline" onClick={() => navigate('/admin/products')}>
          Voltar para Produtos
        </Button>
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
                    placeholder="Descreva o produto detalhadamente. Ex: Refrigerante Cola 350ml"
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
    </Layout>
  );
};

export default ProductAI;
