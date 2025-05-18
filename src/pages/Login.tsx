
import { useState } from "react";
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
        throw error;
      }

      console.log("Login bem-sucedido:", data);

      // Verificar se o usuário é um administrador
      if (data.user) {
        // Consulta direta na tabela user_roles usando o ID do usuário
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", data.user.id)
          .single();

        console.log("Dados de role:", roleData, "Erro de role:", roleError);

        if (roleError && roleError.code !== 'PGRST116') {
          console.error("Erro ao verificar papel do usuário:", roleError);
          toast.error("Erro ao verificar permissões de administrador");
          setIsLoading(false);
          return;
        }

        // Se o usuário tiver algum registro na tabela user_roles com role = admin
        if (roleData && roleData.role === "admin") {
          // Armazenar a sessão do usuário localmente para persistência
          localStorage.setItem("supabase_auth_session", JSON.stringify({
            user: data.user,
            session: data.session,
            isAdmin: true
          }));
          
          toast.success("Login realizado com sucesso!");
          navigate("/admin");
        } else {
          toast.error("Você não tem permissão para acessar a área de administrador");
          // Garantir que fazemos o logout se o usuário não tem permissão
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
