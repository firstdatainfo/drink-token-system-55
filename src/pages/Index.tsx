
import { CategoryTabs } from "@/components/CategoryTabs";
import { Cart } from "@/components/Cart";
import { categories } from "@/data/mockData";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-pdv-blue flex items-center">
            <span className="bg-pdv-blue text-white p-2 rounded-md mr-2 shadow-sm">PDV</span>
            Sistema de Vendas de Fichas
          </h1>
        </div>
      </header>
        
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm">
            <CategoryTabs categories={categories} />
          </div>
            
          <div className="lg:col-span-1">
            <Cart />
          </div>
        </div>
      </main>
        
      <footer className="bg-white shadow-inner py-4 mt-6">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Sistema de Vendas de Fichas</p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <span className="hover:text-pdv-blue cursor-pointer transition-colors">Termos</span>
              <span className="hover:text-pdv-blue cursor-pointer transition-colors">Privacidade</span>
              <span className="hover:text-pdv-blue cursor-pointer transition-colors">Suporte</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
