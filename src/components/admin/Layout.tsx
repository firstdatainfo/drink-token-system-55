
import { ReactNode, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Tag,
  BarChart,
  Settings,
  LogOut,
  Menu,
  X,
  Printer,
  ChevronDown,
  ChevronLeft
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Verificação de acesso admin usando useQuery para evitar loops infinitos
  const { isLoading, error } = useQuery({
    queryKey: ['adminAccess'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Por favor, faça login para acessar a área administrativa");
        navigate("/login");
        return false;
      }
      
      const userEmail = session.user.email;
      
      // Caso especial para rodrigodev@yahoo.com
      if (userEmail === "rodrigodev@yahoo.com") {
        return true;
      }
      
      // Verificação de admin para outros usuários
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("role", "admin");
        
      if (roleError) {
        throw new Error("Erro ao verificar permissões");
      }
      
      if (!roleData || roleData.length === 0) {
        toast.error("Você não tem permissão para acessar esta área");
        navigate("/login");
        return false;
      }
      
      return true;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos para evitar verificações frequentes
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("supabase_auth_session");
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro durante logout");
    }
  };

  const toggleSettingsMenu = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Produtos",
      path: "/admin/products",
      icon: <Package className="h-5 w-5" />,
    },
    {
      name: "Categorias",
      path: "/admin/categories",
      icon: <Tag className="h-5 w-5" />,
    },
    {
      name: "Relatórios",
      path: "/admin/reports",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      name: "Impressão",
      path: "/admin/printer-settings",
      icon: <Printer className="h-5 w-5" />,
    },
  ];

  const integrationOptions = [
    { name: "Integrações de IA", path: "/admin/settings/ai" },
    { name: "Stone", path: "/admin/settings/stone" },
    { name: "Mercado Pago", path: "/admin/settings/mercadopago" },
    { name: "EFI", path: "/admin/settings/efi" },
    { name: "Sicoob", path: "/admin/settings/sicoob" },
    { name: "Sicredi", path: "/admin/settings/sicredi" },
    { name: "Banco do Brasil", path: "/admin/settings/bancobrasil" },
    { name: "Emissores Fiscais", path: "/admin/settings/fiscal" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Se estiver carregando, mostre um indicador simples
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full border-4 border-gray-300 border-t-pdv-blue h-12 w-12 mb-4"></div>
          <p>Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Se ocorreu erro na verificação de permissão, mostre mensagem de erro
  if (error) {
    console.error("Erro na verificação de autenticação:", error);
  }

  // Mostrar conteúdo principal
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Overlay Background */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static z-40 h-full w-64 bg-white border-r shadow-sm transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600">Painel de Admin</h1>
        </div>

        <nav className="px-4 mt-6 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                location.pathname === item.path
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}

          {/* Botão de Configurações com dropdown */}
          <div className="relative">
            <button 
              onClick={toggleSettingsMenu}
              className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${
                location.pathname.includes('/admin/settings')
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="ml-3">Configurações</span>
              <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isSettingsOpen && (
              <div className="pl-10 mt-1 space-y-1 border-l-2 border-gray-200 ml-4">
                {integrationOptions.map((option) => (
                  <Link
                    key={option.path}
                    to={option.path}
                    className={`flex items-center px-4 py-2 rounded-md text-sm transition-colors ${
                      location.pathname === option.path
                        ? "bg-blue-100 text-blue-800 font-medium"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {option.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <header className="bg-white shadow-sm h-16 flex items-center px-6 sticky top-0 z-10">
          <div className="w-full flex justify-between items-center">
            {location.pathname !== "/admin" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
            )}
            <div className="ml-auto">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                Ir para PDV
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 lg:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
