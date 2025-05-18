
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

  // Improved admin access verification
  useEffect(() => {
    let ignore = false;
    
    async function checkAdminAccess() {
      setIsVerifying(true);
      
      try {
        console.log("Starting admin verification...");
        
        // Try to get session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No active session found, redirecting to login");
          toast.error("Please log in to access the admin area");
          navigate("/login");
          return;
        }
        
        const userId = session.user.id;
        const userEmail = session.user.email;
        
        console.log(`Checking admin access for user: ${userEmail} (${userId})`);
        
        // Special case for rodrigodev@yahoo.com
        if (userEmail === "rodrigodev@yahoo.com") {
          console.log("Special admin user detected");
          
          // Check if admin role exists for this user
          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("*")
            .eq("user_id", userId)
            .eq("role", "admin")
            .maybeSingle();
            
          if (ignore) return;
          
          if (roleError) {
            console.error("Error checking admin role:", roleError);
          }
          
          // If admin role doesn't exist for this special user, try to add it
          if (!roleData) {
            console.log("Attempting to add admin role for special user");
            
            try {
              // First try through RLS
              const { error: insertError } = await supabase
                .from("user_roles")
                .insert({ user_id: userId, role: "admin" });
                
              if (insertError) {
                console.log("Could not insert admin role via RLS:", insertError.message);
                // This is expected if RLS prevents the insert
              }
            } catch (err) {
              console.error("Error granting admin role:", err);
            }
          }
          
          // Allow access for special admin user regardless of DB role status
          if (ignore) return;
          setIsVerifying(false);
          return;
        }
        
        // Standard admin verification for all other users
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", userId)
          .eq("role", "admin");
          
        if (ignore) return;
        
        if (roleError) {
          console.error("Error verifying admin role:", roleError);
          toast.error("Error verifying permissions");
          navigate("/login");
          return;
        }
        
        if (!roleData || roleData.length === 0) {
          console.log("User does not have admin permissions:", userEmail);
          toast.error("You don't have permission to access this area");
          await supabase.auth.signOut();
          navigate("/login");
          return;
        }
        
        console.log("Admin verification completed successfully");
        setIsVerifying(false);
      } catch (error) {
        console.error("Authentication verification error:", error);
        toast.error("Error verifying authentication");
        navigate("/login");
      }
    }
    
    checkAdminAccess();
    
    return () => {
      ignore = true;
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("supabase_auth_session");
      toast.success("Logout successful!");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout");
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
