import { ReactNode, useState, useEffect, useCallback } from "react";
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
  Printer
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [permissionsVerified, setPermissionsVerified] = useState(false);

  // Verificação de acesso admin otimizada para evitar loops infinitos
  useEffect(() => {
    // Executar a verificação apenas uma vez
    if (permissionsVerified) return;
    
    const checkAdminAccess = async () => {
      try {
        console.log("Iniciando verificação de admin...");
        
        // Tentar obter sessão do Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("Nenhuma sessão ativa encontrada, redirecionando para login");
          toast.error("Por favor, faça login para acessar a área administrativa");
          navigate("/login");
          return;
        }
        
        const userId = session.user.id;
        const userEmail = session.user.email;
        
        console.log(`Verificando acesso de admin para usuário: ${userEmail} (${userId})`);
        
        // Caso especial para rodrigodev@yahoo.com
        if (userEmail === "rodrigodev@yahoo.com") {
          console.log("Usuário admin especial detectado");
          
          // Verificar se o papel de admin existe para este usuário
          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("*")
            .eq("user_id", userId)
            .eq("role", "admin")
            .maybeSingle();
            
          if (roleError) {
            console.error("Erro ao verificar papel de admin:", roleError);
          }
          
          // Se o papel de admin não existir para este usuário especial, tentar adicioná-lo
          if (!roleData) {
            console.log("Tentando adicionar papel de admin para usuário especial");
            
            try {
              // Primeiro tentar através do RLS
              const { error: insertError } = await supabase
                .from("user_roles")
                .insert({ user_id: userId, role: "admin" });
                
              if (insertError) {
                console.log("Não foi possível inserir papel de admin via RLS:", insertError.message);
              }
            } catch (err) {
              console.error("Erro ao conceder papel de admin:", err);
            }
          }
          
          // Marcar como verificado e permitir acesso
          setPermissionsVerified(true);
          return;
        }
        
        // Verificação de admin padrão para todos os outros usuários
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", userId)
          .eq("role", "admin");
          
        if (roleError) {
          console.error("Erro ao verificar papel de admin:", roleError);
          toast.error("Erro ao verificar permissões");
          navigate("/login");
          return;
        }
        
        if (!roleData || roleData.length === 0) {
          console.log("Usuário não tem permissões de admin:", userEmail);
          toast.error("Você não tem permissão para acessar esta área");
          await supabase.auth.signOut();
          navigate("/login");
          return;
        }
        
        console.log("Verificação de admin concluída com sucesso");
        setPermissionsVerified(true);
      } catch (error) {
        console.error("Erro na verificação de autenticação:", error);
        toast.error("Erro ao verificar autenticação");
        navigate("/login");
      }
    }
    
    checkAdminAccess();
  }, [navigate, permissionsVerified]);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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
          <div className="w-full flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              Ir para PDV
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 lg:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
