
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Category, Product } from "@/types";
import { useQuery } from "@tanstack/react-query";

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
