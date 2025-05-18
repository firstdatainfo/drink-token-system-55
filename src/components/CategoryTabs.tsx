
import { useState } from "react";
import { Category } from "@/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProductGrid } from "@/components/ProductGrid";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCategories, useProductsByCategoryId } from "@/hooks/useSupabaseData";
import { Loader2 } from "lucide-react";

export function CategoryTabs() {
  const { data: categories = [], isLoading: isLoadingCategories, isError } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    categories.length > 0 ? categories[0].id : null
  );
  
  const { 
    data: categoryProducts = [], 
    isLoading: isLoadingProducts 
  } = useProductsByCategoryId(selectedCategoryId);
  
  // Se não há categorias ainda e está carregando, mostre um loader
  if (isLoadingCategories) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-pdv-blue" />
        <span className="ml-2">Carregando categorias...</span>
      </div>
    );
  }
  
  // Se ocorreu um erro ou não há categorias
  if (isError || categories.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-gray-500">Não foi possível carregar as categorias.</p>
      </div>
    );
  }
  
  // Atualiza a categoria selecionada se ainda não estiver definida
  if (selectedCategoryId === null && categories.length > 0) {
    setSelectedCategoryId(categories[0].id);
  }

  return (
    <Tabs 
      value={selectedCategoryId?.toString()} 
      onValueChange={(value) => setSelectedCategoryId(Number(value))}
      className="w-full"
    >
      <div className="relative">
        <ScrollArea className="w-full whitespace-nowrap pb-3">
          <TabsList className="inline-flex w-max px-1 bg-pdv-gray rounded-lg">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id.toString()}
                className="text-md py-2 px-4 transition-all data-[state=active]:bg-pdv-blue data-[state=active]:text-white data-[state=active]:shadow-md rounded-md"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>
      </div>
      
      <div className="mt-4">
        {isLoadingProducts ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-pdv-blue" />
            <span className="ml-2">Carregando produtos...</span>
          </div>
        ) : (
          <TabsContent value={selectedCategoryId?.toString() || ""}>
            <ProductGrid products={categoryProducts} />
          </TabsContent>
        )}
      </div>
    </Tabs>
  );
}
