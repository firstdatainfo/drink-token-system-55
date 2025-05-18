
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
  const [isVerifying, setIsVerifying] = useState(true);

  // Proteção aprimorada para acesso de admin com verificação de sessão local
  useEffect(() => {
    let ignore = false;

    async function checkAdminRole() {
      setIsVerifying(true);
      
      try {
        console.log("Iniciando verificação de admin...");
        
        // Primeiro tenta obter a sessão do Supabase
        const { data: { session } } = await supabase.auth.getSession();
        let userId = session?.user?.id;
        let isSessionValid = !!session;

        // Se não encontrou sessão no Supabase, verifica o localStorage
        if (!userId) {
          console.log("Sessão não encontrada no Supabase, verificando localStorage...");
          const storedSession = localStorage.getItem("supabase_auth_session");
          if (storedSession) {
            try {
              const parsedSession = JSON.parse(storedSession);
              userId = parsedSession.user?.id;
              
              // Se temos dados de sessão no localStorage mas não no Supabase,
              // tentamos estabelecer a sessão novamente
              if (userId && parsedSession.session) {
                try {
                  console.log("Tentando restaurar sessão do localStorage...");
                  const { data, error } = await supabase.auth.setSession({
                    access_token: parsedSession.session.access_token,
                    refresh_token: parsedSession.session.refresh_token
                  });
                  
                  isSessionValid = !!data.session && !error;
                  
                  if (error) {
                    console.error("Erro ao restaurar sessão:", error);
                    localStorage.removeItem("supabase_auth_session");
                    isSessionValid = false;
                  } else {
                    console.log("Sessão restaurada com sucesso!");
                    userId = data.session?.user.id;
                  }
                } catch (setSessionError) {
                  console.error("Erro ao restaurar sessão:", setSessionError);
                  localStorage.removeItem("supabase_auth_session");
                  isSessionValid = false;
                }
              }
            } catch (parseError) {
              console.error("Erro ao analisar dados da sessão:", parseError);
              localStorage.removeItem("supabase_auth_session");
              isSessionValid = false;
            }
          }
        }

        if (!userId || !isSessionValid) {
          console.log("Sessão inválida, redirecionando para login");
          toast.error("Sessão expirada ou inválida. Por favor, faça login novamente.");
          localStorage.removeItem("supabase_auth_session");
          navigate("/login");
          return;
        }

        console.log("Verificando papel do usuário para:", userId);
        
        // Verificação aprimorada para o papel 'admin'
        // Primeiro, tentamos com a tabela user_roles
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin");

        if (ignore) return;

        if (roleError) {
          console.error("Erro ao verificar papel do usuário:", roleError);
          toast.error("Erro ao verificar permissões");
          navigate("/login");
          return;
        }

        // Se for rodrigodev@yahoo.com, faça uma verificação especial e force o papel admin
        const { data: userData } = await supabase
          .from("users")
          .select("email")
          .eq("id", userId)
          .single();

        const isSpecialAdmin = userData?.email === "rodrigodev@yahoo.com";
        
        if (isSpecialAdmin) {
          console.log("Usuário especial detectado:", userData.email);
          
          // Verificar se já tem o papel admin
          if (!roleData || roleData.length === 0) {
            // Tentar inserir o papel admin para este usuário
            console.log("Tentando adicionar papel admin para usuário especial");
            const { error: insertError } = await supabase
              .from("user_roles")
              .insert({ user_id: userId, role: "admin" })
              .select();
              
            if (insertError) {
              console.error("Erro ao adicionar papel admin:", insertError);
            } else {
              console.log("Papel admin adicionado com sucesso!");
            }
          }
          
          // Permitir acesso mesmo se a inserção falhar
          setIsVerifying(false);
          return;
        }

        // Verificação padrão para outros usuários
        if (!roleData || roleData.length === 0) {
          console.log("Usuário não tem permissões de administrador:", userData?.email);
          toast.error("Você não tem permissão para acessar esta área.");
          await supabase.auth.signOut();
          localStorage.removeItem("supabase_auth_session");
          navigate("/login");
          return;
        }

        console.log("Verificação de admin concluída com sucesso");
        setIsVerifying(false);
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        toast.error("Erro ao verificar autenticação");
        navigate("/login");
      }
    }

    checkAdminRole();

    return () => {
      ignore = true;
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
      toast.error("Erro ao fazer logout");
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

  if (isVerifying) {
    // Exibir um loading enquanto verifica
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-lg text-pdv-blue animate-pulse">Verificando permissões...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar - Mobile (overlay) */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={toggleMobileMenu}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Sidebar Content */}
      <div
        className={`fixed lg:static z-40 h-full w-64 bg-white border-r shadow-sm transform transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold text-pdv-blue">Painel de Admin</h1>
        </div>

        <nav className="px-4 mt-6 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                location.pathname === item.path
                  ? "bg-pdv-blue text-white"
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
      <div className="flex-1 overflow-x-hidden bg-gray-50">
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
