
import { CategoryTabs } from "@/components/CategoryTabs";
import { Cart } from "@/components/Cart";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleAdminAccess = () => {
    // Redirecionar para a página de login em vez de diretamente para o admin
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md py-3 sm:py-4 sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold text-pdv-blue flex items-center">
            <span className="bg-pdv-blue text-white p-1 sm:p-2 rounded-md mr-2 shadow-sm">PDV</span>
            Sistema de Vendas
          </h1>
          <Button 
            variant="outline" 
            className="bg-pdv-blue text-white hover:bg-pdv-blue/80 w-full sm:w-auto"
            onClick={handleAdminAccess}
          >
            Área Administrativa
          </Button>
        </div>
      </header>
        
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 bg-white p-3 sm:p-4 rounded-lg shadow-sm">
            <CategoryTabs />
          </div>
            
          <div className="lg:col-span-1">
            <Cart />
          </div>
        </div>
      </main>
        
      <footer className="bg-white shadow-inner py-3 sm:py-4 mt-4 sm:mt-6">
        <div className="container mx-auto px-3 sm:px-4 text-center text-gray-500">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm sm:text-base">&copy; {new Date().getFullYear()} Sistema de Vendas de Fichas</p>
            <div className="flex space-x-4 mt-2 md:mt-0 text-sm sm:text-base">
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
