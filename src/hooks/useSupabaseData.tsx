
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Category, Product } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Erro ao buscar categorias:", error);
        toast.error("Falha ao carregar categorias");
        throw error;
      }
      
      return data as Category[];
    },
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `);
      
      if (productsError) {
        console.error("Erro ao buscar produtos:", productsError);
        toast.error("Falha ao carregar produtos");
        throw productsError;
      }
      
      // Mapear os produtos para o formato esperado
      return products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.categories?.name || "Sem categoria",
        category_id: product.category_id,
        image: product.image,
        description: product.description
      })) as Product[];
    },
  });
}

export function useProductsByCategoryId(categoryId: number | null) {
  return useQuery({
    queryKey: ['products', categoryId],
    queryFn: async () => {
      if (categoryId === null) {
        return [] as Product[];
      }
      
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .eq('category_id', categoryId);
      
      if (productsError) {
        console.error("Erro ao buscar produtos por categoria:", productsError);
        toast.error("Falha ao carregar produtos da categoria");
        throw productsError;
      }
      
      return products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.categories?.name || "Sem categoria",
        category_id: product.category_id,
        image: product.image,
        description: product.description
      })) as Product[];
    },
    enabled: categoryId !== null,
  });
}

// Nova função para upload de imagem
export async function uploadProductImage(file: File) {
  try {
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    const { data, error } = await supabase.storage
      .from('product_images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) {
      console.error("Erro no upload da imagem:", error);
      toast.error(`Erro no upload: ${error.message}`);
      throw error;
    }
    
    // Obter a URL pública da imagem
    const { data: publicUrlData } = supabase.storage
      .from('product_images')
      .getPublicUrl(data.path);
      
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Falha no upload da imagem:", error);
    toast.error("Falha no upload da imagem");
    throw error;
  }
}

// Nova função para deletar imagem
export async function deleteProductImage(imagePath: string) {
  try {
    // Extrair o caminho do arquivo da URL completa
    const path = imagePath.split('/').pop();
    
    if (!path) {
      console.error("Caminho da imagem inválido");
      return false;
    }
    
    const { error } = await supabase.storage
      .from('product_images')
      .remove([path]);
      
    if (error) {
      console.error("Erro ao deletar imagem:", error);
      toast.error(`Erro ao deletar imagem: ${error.message}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Falha ao deletar imagem:", error);
    toast.error("Falha ao deletar imagem");
    return false;
  }
}
