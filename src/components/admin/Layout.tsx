
import { ReactNode, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, Tag, BarChart, Settings, LogOut, Menu, X, Printer, ChevronDown, ChevronLeft, Receipt } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({
  children
}: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Verificar se o usuário está autenticado ao carregar o componente
  useEffect(() => {
    const checkAuth = async () => {
      // Primeiro, tentar obter a sessão do localStorage como backup
      let localSession = null;
      try {
        const sessionStr = localStorage.getItem("supabase_auth_session");
        if (sessionStr) {
          localSession = JSON.parse(sessionStr);
        }
      } catch (error) {
        console.error("Erro ao parsear sessão do localStorage:", error);
      }

      // Em seguida, verificar com o Supabase
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          setIsAuthenticated(true);
        } else if (localSession?.user) {
          // Se temos um usuário no backup do localStorage, mas não no Supabase
          // Vamos restaurar a sessão para o Supabase
          console.log("Restaurando sessão do localStorage para o Supabase");
          try {
            await supabase.auth.setSession({
              access_token: localSession.session.access_token,
              refresh_token: localSession.session.refresh_token
            });
            setIsAuthenticated(true);
          } catch (sessionError) {
            console.error("Erro ao restaurar sessão:", sessionError);
            navigate("/login");
          }
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        if (localSession?.user) {
          // Tentativa de recuperação final usando dados do localStorage
          setIsAuthenticated(true);
        } else {
          navigate("/login");
        }
      }
    };

    checkAuth();

    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        // Salvar cópia de backup no localStorage
        if (session) {
          localStorage.setItem("supabase_auth_session", JSON.stringify({
            user: session.user,
            session: session
          }));
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        localStorage.removeItem("supabase_auth_session");
        navigate("/login");
      }
    });

    // Limpar listener ao desmontar
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

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

  const menuItems = [{
    name: "Dashboard",
    path: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />
  }, {
    name: "Produtos",
    path: "/admin/products",
    icon: <Package className="h-5 w-5" />
  }, {
    name: "Categorias",
    path: "/admin/categories",
    icon: <Tag className="h-5 w-5" />
  }, {
    name: "Fichas Vendidas",
    path: "/admin/fichas-vendidas",
    icon: <Receipt className="h-5 w-5" />
  }, {
    name: "Relatórios",
    path: "/admin/reports",
    icon: <BarChart className="h-5 w-5" />
  }, {
    name: "Impressão",
    path: "/admin/printer-settings",
    icon: <Printer className="h-5 w-5" />
  }];

  const integrationOptions = [{
    name: "Integrações de IA",
    path: "/admin/settings/ai"
  }, {
    name: "Stone",
    path: "/admin/settings/stone"
  }, {
    name: "Mercado Pago",
    path: "/admin/settings/mercadopago"
  }, {
    name: "EFI",
    path: "/admin/settings/efi"
  }, {
    name: "Sicoob",
    path: "/admin/settings/sicoob"
  }, {
    name: "Sicredi",
    path: "/admin/settings/sicredi"
  }, {
    name: "Banco do Brasil",
    path: "/admin/settings/bancobrasil"
  }, {
    name: "Emissores Fiscais",
    path: "/admin/settings/fiscal"
  }];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!isAuthenticated) {
    // Podemos mostrar um spinner ou nada enquanto verificamos a autenticação
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500">Verificando autenticação...</p>
      </div>
    </div>;
  }

  return <div className="flex min-h-screen bg-gray-50 relative">
    {/* Mobile Menu Button */}
    <div className="lg:hidden fixed top-4 left-4 z-50">
      <Button variant="outline" size="icon" onClick={toggleMobileMenu} className="bg-white shadow-md">
        {isMobileMenuOpen ? <X /> : <Menu />}
      </Button>
    </div>

    {/* Mobile Overlay Background */}
    {isMobileMenuOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={toggleMobileMenu} />}

    {/* Sidebar */}
    <div className={`fixed lg:static z-40 h-screen w-64 bg-white border-r shadow-sm transition-transform duration-300 overflow-auto ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
      <div className="p-4 lg:p-6">
        <h1 className="text-blue-600 font-extrabold text-sm px-[46px] mx-0 my-[11px] py-0">Painel de Admin</h1>
      </div>

      <nav className="mt-4 space-y-1 px-[38px] my-[19px] py-[14px] mx-0">
        {menuItems.map(item => <Link key={item.path} to={item.path} className={`flex items-center px-3 py-2 rounded-md transition-colors ${location.pathname === item.path ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`} onClick={() => setIsMobileMenuOpen(false)}>
            {item.icon}
            <span className="ml-2 text-sm lg:text-base">{item.name}</span>
          </Link>)}

        {/* Botão de Configurações com dropdown */}
        <div className="relative">
          <button onClick={toggleSettingsMenu} className={`w-full flex items-center px-3 py-2 rounded-md transition-colors ${location.pathname.includes('/admin/settings') ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}>
            <Settings className="h-5 w-5" />
            <span className="ml-2 text-sm lg:text-base">Configurações</span>
            <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isSettingsOpen && <div className="pl-8 mt-1 space-y-1 border-l-2 border-gray-200 ml-3">
              {integrationOptions.map(option => <Link key={option.path} to={option.path} className={`flex items-center px-3 py-2 rounded-md text-xs lg:text-sm transition-colors ${location.pathname === option.path ? "bg-blue-100 text-blue-800 font-medium" : "hover:bg-gray-50 text-gray-700"}`} onClick={() => setIsMobileMenuOpen(false)}>
                  {option.name}
                </Link>)}
            </div>}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-3 border-t bg-white">
        <Button variant="outline" className="w-full flex items-center justify-center py-1 text-sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" /> Sair
        </Button>
      </div>
    </div>

    {/* Main Content */}
    <div className="flex-1 w-full">
      <header className="bg-white shadow-sm h-14 lg:h-16 flex items-center px-4 lg:px-6 sticky top-0 z-10">
        <div className="w-full flex justify-between items-center ml-8 lg:ml-0">
          {location.pathname !== "/admin" && <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center">
              <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>}
          <div className="ml-auto">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-xs lg:text-sm">
              Ir para PDV
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 lg:px-6 lg:py-6">
        {children}
      </main>
    </div>
  </div>;
}
