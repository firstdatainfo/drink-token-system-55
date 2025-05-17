
import { Category } from "@/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProductGrid } from "@/components/ProductGrid";
import { products } from "@/data/mockData";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryTabsProps {
  categories: Category[];
}

export function CategoryTabs({ categories }: CategoryTabsProps) {
  return (
    <Tabs defaultValue={categories[0].id.toString()} className="w-full">
      <div className="relative">
        <ScrollArea className="w-full whitespace-nowrap pb-3" orientation="horizontal">
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
      
      {categories.map((category) => (
        <TabsContent key={category.id} value={category.id.toString()}>
          <ProductGrid
            products={products.filter(
              (product) => product.category === category.name
            )}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
