import { useState, useEffect } from "react";
import { Layout } from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, ImageIcon, Image, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Product, Category } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const Products = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category_id: 0,
    image: "",
    description: ""
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();

  // Fetch products from Supabase
  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          image,
          description,
          category_id,
          categories(name)
        `)
        .order('id');
      
      if (error) throw error;
      
      // Format the data to match our expected Product type
      return data.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.categories?.name || '',
        category_id: item.category_id,
        image: item.image || '',
        description: item.description || ''
      })) as Product[];
    },
  });

  // Fetch categories for the dropdown
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Category[];
    },
  });

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (productData: Omit<Product, 'id' | 'category'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Produto adicionado com sucesso!");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error adding product:", error);
      toast.error("Erro ao adicionar produto.");
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...productData }: { id: number } & Omit<Product, 'id' | 'category'>) => {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Produto atualizado com sucesso!");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error updating product:", error);
      toast.error("Erro ao atualizar produto.");
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Produto excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Error deleting product:", error);
      toast.error("Erro ao excluir produto.");
    },
  });

  const handleAddEdit = (product: Product | null = null) => {
    setSelectedFile(null);
    if (product) {
      setCurrentProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toFixed(2).replace('.', ','),
        category_id: product.category_id || 0,
        image: product.image || "",
        description: product.description || ""
      });
      setImagePreview(product.image || null);
    } else {
      setCurrentProduct(null);
      setFormData({
        name: "",
        price: "",
        category_id: categories.length > 0 ? categories[0].id : 0,
        image: "",
        description: ""
      });
      setImagePreview(null);
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Tipo de arquivo inválido. Apenas JPG, PNG, GIF, WebP são permitidos.");
        setSelectedFile(null);
        setImagePreview(formData.image || null);
        e.target.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande. O tamanho máximo é 5MB.");
        setSelectedFile(null);
        setImagePreview(formData.image || null);
        e.target.value = "";
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData({ ...formData, image: "" });
    } else {
      setSelectedFile(null);
      setImagePreview(currentProduct?.image || null);
    }
  };

  const handleImageUploadAndFormSubmit = async (productDataSansImage: Omit<Product, 'id' | 'category' | 'image'>) => {
    setIsUploading(true);
    let imageUrl = currentProduct?.image || "";

    if (selectedFile) {
      const fileName = `${Date.now()}_${selectedFile.name.replace(/\s+/g, '_')}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product_images')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        toast.error(`Erro no upload da imagem: ${uploadError.message}`);
        console.error("Upload error:", uploadError);
        setIsUploading(false);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('product_images')
        .getPublicUrl(uploadData.path);
      
      imageUrl = publicUrlData.publicUrl;
    } else if (formData.image) {
      imageUrl = formData.image;
    }

    const finalProductData = { ...productDataSansImage, image: imageUrl };

    if (currentProduct) {
      updateProductMutation.mutate({ id: currentProduct.id, ...finalProductData });
    } else {
      addProductMutation.mutate(finalProductData);
    }
    setIsUploading(false);
  };

  const newHandleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }
    
    const priceString = formData.price.trim();
    if (priceString === "") {
      toast.error("O preço é obrigatório.");
      return;
    }
    const priceAsNumber = parseFloat(priceString.replace(',', '.'));
    if (isNaN(priceAsNumber) || priceAsNumber <= 0) {
      toast.error("Preço inválido. Deve ser um número positivo e no formato correto (ex: 12,90 ou 12).");
      return;
    }
    const normalizedPriceString = priceAsNumber.toString(); 
    const parts = normalizedPriceString.split('.');
    if (parts.length > 1 && parts[1].length > 2) {
      toast.error("O preço não pode ter mais que duas casas decimais.");
      return;
    }
    
    const productDataSansImage = {
      name: formData.name,
      price: priceAsNumber,
      category_id: formData.category_id,
      description: formData.description,
    };

    handleImageUploadAndFormSubmit(productDataSansImage);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    value = value.replace(/[^\d,.]/g, "");
    value = value.replace(/\./g, ",");
    if (value.indexOf(',') !== -1) {
      value = value.substring(0, value.indexOf(',') + 1) + value.substring(value.indexOf(',') + 1).replace(/,/g, "");
    }
    if (value.split(',').length > 1) {
      if (value.split(',')[1].length > 2) {
        value = value.substring(0, value.indexOf(',') + 3);
      }
    }
    setFormData({ ...formData, price: value });
  };

  const isImageValid = (url: string | null): boolean => {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp)(\?.*)?$/i) !== null || 
           url.startsWith('http') || 
           url.startsWith('data:image');
  };

  if (productsError) {
    toast.error("Erro ao carregar produtos.");
    console.error("Error loading products:", productsError);
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Produtos</h1>
        <Button onClick={() => handleAddEdit()} className="bg-pdv-green hover:bg-pdv-green/90">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-pdv-blue" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>
                      {isImageValid(product.image) ? (
                        <div className="w-16 h-16 rounded overflow-hidden bg-gray-50 border">
                          <AspectRatio ratio={1/1} className="flex items-center justify-center">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-full object-contain" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          </AspectRatio>
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded border">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>R$ {product.price.toFixed(2).replace('.', ',')}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAddEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentProduct ? "Editar Produto" : "Adicionar Produto"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={newHandleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input 
                  id="price" 
                  inputMode="decimal"
                  value={formData.price}
                  onChange={handlePriceChange}
                  placeholder="0,00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={formData.category_id?.toString() || (categories.length > 0 ? categories[0].id.toString() : "")} 
                  onValueChange={(value) => setFormData({...formData, category_id: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image-upload">Imagem do Produto</Label>
                <Input 
                  id="image-upload" 
                  type="file"
                  accept="image/jpeg, image/png, image/gif, image/webp"
                  onChange={handleFileSelected}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-pdv-blue file:text-white hover:file:bg-pdv-blue/90"
                />
                {formData.image && !selectedFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    URL atual: <a href={formData.image} target="_blank" rel="noopener noreferrer" className="text-pdv-blue hover:underline truncate block max-w-xs">{formData.image}</a>
                  </p>
                )}
              </div>
            </div>

            {/* Image Preview */}
            {imagePreview ? (
              <div className="mt-4 border rounded-md p-2">
                <Label className="block mb-2 text-sm">Prévia da imagem:</Label>
                <div className="bg-gray-50 rounded overflow-hidden h-48 flex items-center justify-center">
                  <AspectRatio ratio={1/1} className="w-full h-full">
                    <img 
                      src={imagePreview} 
                      alt="Prévia"
                      className="object-contain w-full h-full"
                      onError={() => {
                        toast.info("Não foi possível carregar a prévia da imagem. Tente outra imagem ou URL.");
                        setImagePreview(null);
                        setSelectedFile(null);
                        const input = document.getElementById('image-upload') as HTMLInputElement;
                        if (input) input.value = "";
                      }}
                    />
                  </AspectRatio>
                </div>
              </div>
            ) : (
              <div className="mt-4 border rounded-md p-2 bg-gray-50 h-36 flex flex-col items-center justify-center">
                <UploadCloud className="mx-auto h-10 w-10 mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Sem prévia de imagem</p>
                <p className="text-xs text-gray-400 mt-1">Tamanho máx. 5MB. JPG, PNG, GIF, WebP.</p>
              </div>
            )}
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isUploading || addProductMutation.isPending || updateProductMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isUploading || addProductMutation.isPending || updateProductMutation.isPending}
              >
                {(isUploading || addProductMutation.isPending || updateProductMutation.isPending) ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                ) : (
                  currentProduct ? "Atualizar" : "Adicionar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Products;
