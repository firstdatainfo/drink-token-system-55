
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

  // Debug helper
  const addDebug = (message) => {
    console.log(message);
    setDebugMessage(prev => prev + "\n" + message);
  };

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        if (debugMode) addDebug("Checking for existing session...");
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.email) {
          if (debugMode) addDebug(`Found session for ${session.user.email}`);
          
          // For the special admin user
          if (session.user.email === "rodrigodev@yahoo.com") {
            if (debugMode) addDebug("Special admin user detected, redirecting to admin");
            navigate("/admin");
            return;
          }
          
          // Check if user has admin role
          const { data: userRoles } = await supabase
            .from("user_roles")
            .select("*")
            .eq("user_id", session.user.id)
            .eq("role", "admin");
            
          if (userRoles && userRoles.length > 0) {
            if (debugMode) addDebug("User has admin role, redirecting to admin");
            navigate("/admin");
          } else {
            if (debugMode) addDebug("User has no admin permissions");
            toast.error("Você não possui permissões de administrador");
          }
        } else {
          if (debugMode) addDebug("No active session found");
        }
      } catch (error) {
        console.error("Session check error:", error);
        if (debugMode) addDebug(`Session check error: ${error.message}`);
      }
    };
    
    checkSession();
  }, [navigate, debugMode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    setIsLoading(true);
    setDebugMessage("");
    
    try {
      if (isRegister) {
        // Handle registration
        if (debugMode) addDebug(`Attempting to register: ${email}`);
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });
        
        if (error) {
          console.error("Registration error:", error);
          if (debugMode) addDebug(`Registration error: ${error.message}`);
          
          if (error.message.includes("already registered")) {
            toast.error("Este email já está registrado. Tente fazer login.");
            setIsRegister(false);
          } else {
            toast.error(`Erro ao registrar: ${error.message}`);
          }
          
          setIsLoading(false);
          return;
        }
        
        // Special case for rodrigodev@yahoo.com
        if (email === "rodrigodev@yahoo.com") {
          if (debugMode) addDebug("Special admin user registered");
          toast.success("Registro realizado com sucesso! Este usuário terá permissões de administrador.");
          
          // Attempt auto-login after registration
          setTimeout(() => {
            handleSpecialAdminLogin(email, password);
          }, 1500);
        } else {
          toast.success("Registro realizado com sucesso! Verifique seu email para confirmar a conta.");
          setIsRegister(false);
          setIsLoading(false);
        }
        
        return;
      }
      
      // Handle login
      await handleSpecialAdminLogin(email, password);
      
    } catch (error) {
      console.error("Login error:", error);
      if (debugMode) addDebug(`General error: ${error?.message || "Unknown error"}`);
      toast.error(error?.message || "Erro ao fazer login");
      setIsLoading(false);
    }
  };
  
  // Specialized login handler with enhanced admin handling
  const handleSpecialAdminLogin = async (loginEmail, loginPassword) => {
    try {
      if (debugMode) addDebug(`Attempting login: ${loginEmail}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
      });
      
      if (error) {
        console.error("Login error:", error);
        if (debugMode) addDebug(`Login error: ${error.message}`);
        
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
      
      const userId = data.user.id;
      const userEmail = data.user.email;
      
      if (debugMode) addDebug(`Login successful for ${userEmail}`);
      
      // Special handling for the admin user
      if (userEmail === "rodrigodev@yahoo.com") {
        if (debugMode) addDebug("Special admin user detected");
        
        // Create session info in localStorage for backup
        localStorage.setItem("supabase_auth_session", JSON.stringify({
          user: data.user,
          session: data.session,
          isAdmin: true
        }));
        
        toast.success("Login realizado com sucesso!");
        navigate("/admin");
        return;
      }
      
      // Standard admin role check for other users
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .eq("role", "admin");
      
      if (roleData && roleData.length > 0) {
        if (debugMode) addDebug("User has admin role");
        
        localStorage.setItem("supabase_auth_session", JSON.stringify({
          user: data.user,
          session: data.session,
          isAdmin: true
        }));
        
        toast.success("Login realizado com sucesso!");
        navigate("/admin");
      } else {
        if (debugMode) addDebug("User has no admin permissions");
        await supabase.auth.signOut();
        localStorage.removeItem("supabase_auth_session");
        toast.error("Você não possui permissões de administrador");
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Login processing error:", error);
      if (debugMode) addDebug(`Login processing error: ${error?.message}`);
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
              
              {debugMode && (
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
