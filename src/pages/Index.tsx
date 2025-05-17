
import { CartProvider } from "@/context/CartContext";
import { CategoryTabs } from "@/components/CategoryTabs";
import { Cart } from "@/components/Cart";
import { categories } from "@/data/mockData";

const Index = () => {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm py-4">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold text-pdv-blue">Sistema de Vendas de Fichas</h1>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CategoryTabs categories={categories} />
            </div>
            
            <div className="lg:col-span-1">
              <Cart />
            </div>
          </div>
        </main>
        
        <footer className="bg-white shadow-inner py-4 mt-6">
          <div className="container mx-auto px-4 text-center text-gray-500">
            &copy; {new Date().getFullYear()} Sistema de Vendas de Fichas
          </div>
        </footer>
      </div>
    </CartProvider>
  );
};

export default Index;
