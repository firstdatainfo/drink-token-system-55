
import { useState, useEffect } from "react";
import { Layout } from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Product, Category } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Products = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    category_id: 0,
    image: "",
    description: ""
  });

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
    if (product) {
      setCurrentProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        category_id: product.category_id || 0,
        image: product.image || "",
        description: product.description || ""
      });
    } else {
      setCurrentProduct(null);
      setFormData({
        name: "",
        price: 0,
        category_id: categories.length > 0 ? categories[0].id : 0,
        image: "",
        description: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }
    
    if (formData.price <= 0) {
      toast.error("O preço deve ser maior que zero");
      return;
    }
    
    const productData = {
      name: formData.name,
      price: formData.price,
      category_id: formData.category_id,
      image: formData.image,
      description: formData.description,
    };

    if (currentProduct) {
      // Update existing product
      updateProductMutation.mutate({ id: currentProduct.id, ...productData });
    } else {
      // Add new product
      addProductMutation.mutate(productData);
    }
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
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-10 h-10 object-contain" 
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                          Sem img
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>R$ {product.price.toFixed(2)}</TableCell>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentProduct ? "Editar Produto" : "Adicionar Produto"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input 
                id="price" 
                type="number" 
                step="0.01"
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select 
                value={formData.category_id.toString()} 
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
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input 
                id="description" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">URL da Imagem (opcional)</Label>
              <Input 
                id="image" 
                value={formData.image} 
                onChange={(e) => setFormData({...formData, image: e.target.value})}
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={addProductMutation.isPending || updateProductMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={addProductMutation.isPending || updateProductMutation.isPending}
              >
                {(addProductMutation.isPending || updateProductMutation.isPending) ? (
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
