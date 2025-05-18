
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ThumbsUp, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Verificar se já existe uma sessão ativa ao carregar a página
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Verificar se o usuário é um administrador
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("role", "admin");

        if (roleError) {
          console.error("Erro ao verificar permissões:", roleError);
          return;
        }

        if (roleData && roleData.length > 0) {
          // Se for administrador, redirecionar para área admin
          navigate("/admin");
        }
      }
    };

    checkExistingSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Usar autenticação do Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Erro de login:", error);
        setLoginAttempts(prev => prev + 1);
        
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Credenciais inválidas. Por favor, verifique seu email e senha.");
        } else {
          toast.error(`Erro ao fazer login: ${error.message}`);
        }
        
        setIsLoading(false);
        return;
      }

      // Verificar se o usuário é um administrador
      if (data.user) {
        // Consulta na tabela user_roles para verificar se é admin
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", data.user.id)
          .eq("role", "admin");

        if (roleError) {
          console.error("Erro ao verificar papel do usuário:", roleError);
          toast.error("Erro ao verificar permissões de administrador");
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }

        // Se o usuário tiver algum registro na tabela user_roles com role = admin
        if (roleData && roleData.length > 0) {
          // Armazenar a sessão do usuário localmente para persistência
          localStorage.setItem("supabase_auth_session", JSON.stringify({
            user: data.user,
            session: data.session,
            isAdmin: true
          }));
          
          toast.success("Login realizado com sucesso!");
          navigate("/admin");
        } else {
          // Mostrar uma mensagem mais específica sobre a falta de permissões
          toast.error("Você não possui permissões de administrador");
          console.log("Usuário não tem permissões de administrador:", data.user.email);
          await supabase.auth.signOut();
          localStorage.removeItem("supabase_auth_session");
        }
      } else {
        toast.error("Credenciais inválidas");
      }
    } catch (error: any) {
      console.error("Erro de login:", error);
      toast.error(error?.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVote = () => {
    setVoteCount(prev => prev + 1);
    toast.success(`Obrigado pelo seu voto! Total: ${voteCount + 1}`);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-pdv-blue">
            Sistema de Vendas de Fichas
          </CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais de administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-pdv-blue hover:bg-pdv-blue/90"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
              
              {loginAttempts > 0 && (
                <p className="text-xs text-red-500 text-center mt-2">
                  {loginAttempts === 1 ? 
                    "Tentativa de login falhou. Verifique suas credenciais." : 
                    `${loginAttempts} tentativas de login falharam. Verifique suas permissões.`}
                </p>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Área restrita para administradores do sistema
          </p>
          <div className="flex items-center justify-center w-full gap-2">
            <Button 
              variant="outline" 
              className="bg-green-500 text-white hover:bg-green-600"
              onClick={handleVote}
            >
              <ThumbsUp className="mr-2" /> Votar ({voteCount})
            </Button>
            <Button
              variant="outline"
              className="bg-gray-100 text-pdv-blue hover:bg-gray-200"
              onClick={handleGoHome}
            >
              <Home className="mr-2" /> Voltar para Home
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
