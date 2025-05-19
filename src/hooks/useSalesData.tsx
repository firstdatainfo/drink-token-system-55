
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type OrderStatus = "pending" | "completed" | "cancelled";

export interface OrderItem {
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  customer_name?: string;
  total_amount: number;
  status: OrderStatus;
  items: OrderItem[];
}

export function useSalesData() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Função para criar um novo pedido
  const createOrder = async (orderData: Order) => {
    setLoading(true);
    
    try {
      console.log("Criando novo pedido:", orderData);
      
      // Inserir o pedido principal
      const { data: orderInsert, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: orderData.customer_name,
          total_amount: orderData.total_amount,
          status: orderData.status
        })
        .select("id")
        .single();
      
      if (orderError) {
        console.error("Erro ao criar pedido:", orderError);
        toast.error("Erro ao criar pedido");
        throw orderError;
      }
      
      if (!orderInsert) {
        throw new Error("Nenhum ID de pedido retornado");
      }
      
      console.log("Pedido criado com ID:", orderInsert.id);
      
      // Inserir os itens do pedido
      const orderItems = orderData.items.map(item => ({
        order_id: orderInsert.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_price: item.product_price,
        quantity: item.quantity,
        subtotal: item.subtotal
      }));
      
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      
      if (itemsError) {
        console.error("Erro ao inserir itens do pedido:", itemsError);
        toast.error("Erro ao salvar itens do pedido");
        throw itemsError;
      }
      
      console.log("Itens do pedido inseridos com sucesso");
      toast.success("Pedido criado com sucesso");
      
      // Atualizar cache de consultas para refletir novos dados
      queryClient.invalidateQueries({ queryKey: ['sold-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['sales-data'] });
      queryClient.invalidateQueries({ queryKey: ['category-data'] });
      queryClient.invalidateQueries({ queryKey: ['product-data'] });
      
      return orderInsert.id;
    } catch (error) {
      console.error("Erro na criação do pedido:", error);
      toast.error("Falha ao processar o pedido");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Hook de mutação para criar pedidos
  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (orderId) => {
      console.log(`Pedido ${orderId} criado com sucesso!`);
      toast.success("Pedido registrado com sucesso");
      
      // Invalidar queries para forçar atualização de dados
      queryClient.invalidateQueries({ queryKey: ['sold-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['sales-data'] });
      queryClient.invalidateQueries({ queryKey: ['category-data'] });
      queryClient.invalidateQueries({ queryKey: ['product-data'] });
    },
    onError: (error) => {
      console.error("Erro na mutação de pedido:", error);
      toast.error("Falha ao registrar pedido");
    }
  });
  
  // Função para atualizar status de pedido
  const updateOrderStatus = async (orderId: number, status: OrderStatus) => {
    setLoading(true);
    
    try {
      console.log(`Atualizando pedido ${orderId} para status: ${status}`);
      
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);
      
      if (error) {
        console.error("Erro ao atualizar status do pedido:", error);
        toast.error("Erro ao atualizar pedido");
        throw error;
      }
      
      console.log("Status do pedido atualizado com sucesso");
      toast.success("Pedido atualizado com sucesso");
      
      // Atualizar cache de consultas
      queryClient.invalidateQueries({ queryKey: ['sold-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['sales-data'] });
      
      return true;
    } catch (error) {
      console.error("Erro na atualização do pedido:", error);
      toast.error("Falha ao atualizar o pedido");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Hook de mutação para atualizar status
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number, status: OrderStatus }) => 
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      toast.success("Status do pedido atualizado");
      
      // Invalidar queries para forçar atualização de dados
      queryClient.invalidateQueries({ queryKey: ['sold-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['sales-data'] });
    }
  });
  
  return {
    loading,
    createOrder,
    createOrderMutation,
    updateOrderStatus,
    updateOrderStatusMutation
  };
}
