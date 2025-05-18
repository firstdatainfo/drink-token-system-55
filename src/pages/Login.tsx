
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ThumbsUp, Home, UserPlus, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [isRegister, setIsRegister] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugMessage, setDebugMessage] = useState("");

  // Função de depuração
  const addDebug = (message) => {
    console.log(message);
    setDebugMessage(prev => prev + "\n" + message);
  };

  // Verificar se já existe uma sessão ativa ao carregar a página
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        if (debugMode) addDebug("Verificando sessão existente...");
        
        // Tentar recuperar sessão do localStorage primeiro
        const storedSession = localStorage.getItem("supabase_auth_session");
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession);
            if (parsed?.isAdmin && parsed?.user) {
              if (debugMode) addDebug(`Sessão encontrada no localStorage: ${parsed.user.email}`);
              navigate("/admin");
              return;
            }
          } catch (e) {
            if (debugMode) addDebug(`Erro ao analisar sessão local: ${e.message}`);
            localStorage.removeItem("supabase_auth_session");
          }
        }

        // Se não encontrou no localStorage, verificar com Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          if (debugMode) addDebug(`Sessão encontrada no Supabase: ${session.user.email}`);
          
          // Verificação especial para rodrigodev@yahoo.com
          if (session.user.email === "rodrigodev@yahoo.com") {
            if (debugMode) addDebug("Email especial detectado, redirecionando para admin...");
            
            localStorage.setItem("supabase_auth_session", JSON.stringify({
              user: session.user,
              session: session,
              isAdmin: true
            }));
            
            navigate("/admin");
            return;
          }
          
          // Verificar papel de admin em user_roles
          const { data: userRoles, error: roleError } = await supabase
            .from("user_roles")
            .select("*")
            .eq("user_id", session.user.id)
            .eq("role", "admin");

          if (roleError) {
            if (debugMode) addDebug(`Erro ao verificar papéis: ${roleError.message}`);
          } else if (userRoles && userRoles.length > 0) {
            if (debugMode) addDebug("Usuário tem papel de admin, redirecionando...");
            
            localStorage.setItem("supabase_auth_session", JSON.stringify({
              user: session.user,
              session: session,
              isAdmin: true
            }));
            
            navigate("/admin");
          } else {
            if (debugMode) addDebug("Usuário não tem papel de admin");
          }
        } else {
          if (debugMode) addDebug("Nenhuma sessão encontrada");
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        if (debugMode) addDebug(`Erro ao verificar sessão: ${error.message}`);
      }
    };

    checkExistingSession();
  }, [navigate, debugMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    setIsLoading(true);
    setDebugMessage("");
    
    try {
      if (isRegister) {
        // Registrar novo usuário
        if (debugMode) addDebug(`Tentando registrar usuário: ${email}`);
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });

        if (error) {
          console.error("Erro ao registrar:", error);
          if (debugMode) addDebug(`Erro ao registrar: ${error.message}`);
          
          if (error.message.includes("already registered")) {
            toast.error("Este email já está registrado. Tente fazer login.");
            setIsRegister(false);
          } else {
            toast.error(`Erro ao registrar: ${error.message}`);
          }
          
          setIsLoading(false);
          return;
        }

        // Se o email for rodrigodev@yahoo.com, informar que será um administrador
        if (email === "rodrigodev@yahoo.com") {
          if (debugMode) addDebug("Email especial detectado: rodrigodev@yahoo.com");
          toast.success("Registro realizado com sucesso! Este usuário terá permissões de administrador.");
          
          // Aguardar um momento e tentar login automático
          setTimeout(async () => {
            await loginAndSetAdmin(email, password);
          }, 1500);
        } else {
          toast.success("Registro realizado com sucesso! Verifique seu email para confirmar a conta.");
          setIsRegister(false);
          setIsLoading(false);
        }
        
        return;
      }
      
      // Fazer login com usuário existente
      await loginAndSetAdmin(email, password);
      
    } catch (error: any) {
      console.error("Erro de login:", error);
      if (debugMode) addDebug(`Erro de login geral: ${error?.message || "Desconhecido"}`);
      toast.error(error?.message || "Erro ao fazer login");
      setIsLoading(false);
    }
  };
  
  const loginAndSetAdmin = async (email: string, password: string) => {
    try {
      if (debugMode) addDebug(`Tentando fazer login: ${email}`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Erro de login:", error);
        if (debugMode) addDebug(`Erro de login: ${error.message}`);
        
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Credenciais inválidas. Por favor, verifique seu email e senha.", {
            icon: <AlertCircle className="h-5 w-5 text-red-500" />
          });
        } else {
          toast.error(`Erro ao fazer login: ${error.message}`);
        }
        
        setIsLoading(false);
        return;
      }

      if (data.user) {
        if (debugMode) addDebug(`Login bem-sucedido: ${data.user.email}`);
        
        // Verificação especial para rodrigodev@yahoo.com
        if (data.user.email === "rodrigodev@yahoo.com") {
          if (debugMode) addDebug("Email especial detectado como admin");
          
          // Verificar se o papel admin já existe
          const { data: roles } = await supabase
            .from("user_roles")
            .select("*")
            .eq("user_id", data.user.id)
            .eq("role", "admin");
            
          if (!roles || roles.length === 0) {
            if (debugMode) addDebug("Tentando inserir papel admin...");
            // Inserir papel admin
            await supabase
              .from("user_roles")
              .insert({ user_id: data.user.id, role: "admin" });
          }
          
          // Armazenar a sessão do usuário localmente
          localStorage.setItem("supabase_auth_session", JSON.stringify({
            user: data.user,
            session: data.session,
            isAdmin: true
          }));
          
          toast.success("Login realizado com sucesso como administrador!");
          navigate("/admin");
          return;
        }
        
        // Verificar papel admin para outros usuários
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", data.user.id)
          .eq("role", "admin");

        if (roleData && roleData.length > 0) {
          if (debugMode) addDebug("Papel admin encontrado");
          localStorage.setItem("supabase_auth_session", JSON.stringify({
            user: data.user,
            session: data.session,
            isAdmin: true
          }));
          
          toast.success("Login realizado com sucesso!");
          navigate("/admin");
        } else {
          if (debugMode) addDebug("Usuário não tem permissões de admin");
          toast.error("Você não possui permissões de administrador");
          await supabase.auth.signOut();
          localStorage.removeItem("supabase_auth_session");
        }
      }
      
      setIsLoading(false);
    } catch (error: any) {
      console.error("Erro ao processar login:", error);
      if (debugMode) addDebug(`Erro ao processar login: ${error?.message}`);
      toast.error(error?.message || "Erro ao processar login");
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

  const toggleAuthMode = () => {
    setIsRegister(!isRegister);
  };

  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
    if (!debugMode) {
      toast("Modo de depuração ativado", { 
        duration: 2000,
        position: 'bottom-left'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-pdv-blue">
            Sistema de Vendas de Fichas
          </CardTitle>
          <CardDescription className="text-center">
            {isRegister 
              ? "Crie uma nova conta de administrador" 
              : "Entre com suas credenciais de administrador"}
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
                {isLoading 
                  ? (isRegister ? "Registrando..." : "Entrando...") 
                  : (isRegister ? "Registrar" : "Entrar")}
              </Button>
              
              <div className="text-center mt-4">
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-pdv-blue"
                  onClick={toggleAuthMode}
                >
                  {isRegister 
                    ? "Já tem uma conta? Faça login" 
                    : "Não tem uma conta? Registre-se"} 
                  <UserPlus className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              {debugMode && debugMessage && (
                <div className="mt-4 p-2 bg-gray-100 rounded text-xs font-mono text-gray-800 max-h-40 overflow-y-auto">
                  <p className="font-semibold">Depuração:</p>
                  {debugMessage.split('\n').map((line, i) => (
                    line ? <div key={i} className="whitespace-pre-wrap">{line}</div> : null
                  ))}
                </div>
              )}

              {isRegister && email === "rodrigodev@yahoo.com" && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                  <p className="font-medium">Email especial detectado!</p>
                  <p>O usuário <strong>rodrigodev@yahoo.com</strong> receberá automaticamente permissões de administrador.</p>
                </div>
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

      <div className="fixed bottom-4 right-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className={`text-xs ${debugMode ? "bg-blue-100" : "bg-gray-100"}`}
          onClick={toggleDebugMode}
        >
          {debugMode ? "Desativar Depuração" : "Ativar Depuração"}
        </Button>
        
        {debugMode && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs bg-gray-100"
            onClick={() => setDebugMessage("")}
          >
            Limpar logs
          </Button>
        )}
      </div>
    </div>
  );
};

export default Login;
