
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ThumbsUp, Home, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRegister, setIsRegister] = useState(false);
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
        addDebug("Verificando sessão existente...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          addDebug(`Sessão encontrada: ${session.user.email}`);
          
          // Verificar se o usuário é um administrador
          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("*")
            .eq("user_id", session.user.id)
            .eq("role", "admin");

          if (roleError) {
            console.error("Erro ao verificar permissões:", roleError);
            addDebug(`Erro ao verificar permissões: ${roleError.message}`);
            return;
          }

          // Verificação especial para rodrigodev@yahoo.com
          const isSpecialAdmin = session.user.email === "rodrigodev@yahoo.com";
          
          if ((roleData && roleData.length > 0) || isSpecialAdmin) {
            // Se for administrador, armazenar na sessão local e redirecionar
            addDebug("Usuário é administrador, redirecionando...");
            localStorage.setItem("supabase_auth_session", JSON.stringify({
              user: session.user,
              session: session,
              isAdmin: true
            }));
            
            console.log("Usuário autenticado como admin, redirecionando...");
            navigate("/admin");
          } else {
            addDebug("Usuário não tem papel de administrador");
          }
        } else {
          addDebug("Nenhuma sessão encontrada");
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        addDebug(`Erro ao verificar sessão: ${error.message}`);
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
      if (isRegister) {
        // Registrar novo usuário
        addDebug(`Tentando registrar usuário: ${email}`);
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });

        if (error) {
          console.error("Erro ao registrar:", error);
          addDebug(`Erro ao registrar: ${error.message}`);
          
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
          addDebug("Email especial detectado: rodrigodev@yahoo.com");
          toast.success("Registro realizado com sucesso! Este usuário terá permissões de administrador.");
          
          // Aguardar um momento para a trigger completar e tentar login automático
          setTimeout(async () => {
            try {
              addDebug("Tentando login automático após registro...");
              const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password
              });

              if (loginError) {
                console.error("Erro ao fazer login automático:", loginError);
                addDebug(`Erro ao fazer login automático: ${loginError.message}`);
                toast.error("Não foi possível fazer login automático. Tente fazer login manualmente.");
                setIsLoading(false);
                return;
              }

              if (loginData && loginData.user) {
                addDebug(`Login automático bem-sucedido: ${loginData.user.email}`);
                
                // Verificar se o usuário tem o papel de admin
                const { data: roleData } = await supabase
                  .from("user_roles")
                  .select("*")
                  .eq("user_id", loginData.user.id)
                  .eq("role", "admin");

                addDebug(`Papel admin encontrado: ${roleData && roleData.length > 0 ? "Sim" : "Não"}`);

                if (roleData && roleData.length > 0) {
                  localStorage.setItem("supabase_auth_session", JSON.stringify({
                    user: loginData.user,
                    session: loginData.session,
                    isAdmin: true
                  }));
                  
                  toast.success("Login realizado com sucesso como administrador!");
                  navigate("/admin");
                } else {
                  // Tentar inserir o papel admin diretamente
                  addDebug("Tentando inserir papel admin manualmente...");
                  const { error: insertError } = await supabase
                    .from("user_roles")
                    .insert({ user_id: loginData.user.id, role: "admin" });
                  
                  if (insertError) {
                    addDebug(`Erro ao inserir papel admin: ${insertError.message}`);
                    toast.error("Erro ao atribuir papel de administrador. Tente novamente.");
                  } else {
                    addDebug("Papel admin inserido com sucesso!");
                    localStorage.setItem("supabase_auth_session", JSON.stringify({
                      user: loginData.user,
                      session: loginData.session,
                      isAdmin: true
                    }));
                    
                    toast.success("Login realizado com sucesso como administrador!");
                    navigate("/admin");
                  }
                }
              }
            } catch (err) {
              console.error("Erro no login automático:", err);
              addDebug(`Erro no login automático: ${err.message}`);
              toast.error("Ocorreu um erro. Tente fazer login manualmente.");
              setIsLoading(false);
            }
          }, 2000);
        } else {
          toast.success("Registro realizado com sucesso! Verifique seu email para confirmar a conta.");
          setIsRegister(false);
          setIsLoading(false);
        }
        
        return;
      }
      
      // Fazer login com usuário existente
      addDebug(`Tentando fazer login: ${email}`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Erro de login:", error);
        addDebug(`Erro de login: ${error.message}`);
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
        addDebug(`Login bem-sucedido: ${data.user.email}`);
        
        // Verificação especial para rodrigodev@yahoo.com
        if (data.user.email === "rodrigodev@yahoo.com") {
          addDebug("Email especial detectado como admin: rodrigodev@yahoo.com");
          
          // Armazenar a sessão do usuário localmente para persistência
          localStorage.setItem("supabase_auth_session", JSON.stringify({
            user: data.user,
            session: data.session,
            isAdmin: true
          }));
          
          toast.success("Login realizado com sucesso como administrador!");
          navigate("/admin");
          return;
        }
        
        // Consulta na tabela user_roles para verificar se é admin
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", data.user.id)
          .eq("role", "admin");

        if (roleError) {
          console.error("Erro ao verificar papel do usuário:", roleError);
          addDebug(`Erro ao verificar papel do usuário: ${roleError.message}`);
          toast.error("Erro ao verificar permissões de administrador");
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }

        // Se o usuário tiver algum registro na tabela user_roles com role = admin
        if (roleData && roleData.length > 0) {
          addDebug("Papel admin encontrado na tabela user_roles");
          // Armazenar a sessão do usuário localmente para persistência
          localStorage.setItem("supabase_auth_session", JSON.stringify({
            user: data.user,
            session: data.session,
            isAdmin: true
          }));
          
          toast.success("Login realizado com sucesso!");
          navigate("/admin");
        } else {
          // Tentar inserir o papel admin se for rodrigodev@yahoo.com
          if (data.user.email === "rodrigodev@yahoo.com") {
            addDebug("Tentando adicionar papel admin para rodrigodev@yahoo.com");
            
            const { error: insertError } = await supabase
              .from("user_roles")
              .insert({ user_id: data.user.id, role: "admin" });
              
            if (insertError) {
              addDebug(`Erro ao inserir papel admin: ${insertError.message}`);
              toast.error("Erro ao atribuir papel de administrador");
              await supabase.auth.signOut();
              localStorage.removeItem("supabase_auth_session");
              setIsLoading(false);
            } else {
              addDebug("Papel admin inserido com sucesso!");
              localStorage.setItem("supabase_auth_session", JSON.stringify({
                user: data.user,
                session: data.session,
                isAdmin: true
              }));
              
              toast.success("Login realizado com sucesso como administrador!");
              navigate("/admin");
            }
          } else {
            // Mostrar uma mensagem mais específica sobre a falta de permissões
            addDebug(`Usuário não tem permissões de administrador: ${data.user.email}`);
            toast.error("Você não possui permissões de administrador");
            await supabase.auth.signOut();
            localStorage.removeItem("supabase_auth_session");
            setIsLoading(false);
          }
        }
      } else {
        toast.error("Credenciais inválidas");
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Erro de login:", error);
      addDebug(`Erro de login geral: ${error?.message || "Desconhecido"}`);
      toast.error(error?.message || "Erro ao fazer login");
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
    setLoginAttempts(0); // resetar tentativas ao mudar de modo
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
              
              {loginAttempts > 0 && !isRegister && (
                <p className="text-xs text-red-500 text-center mt-2">
                  {loginAttempts === 1 ? 
                    "Tentativa de login falhou. Verifique suas credenciais." : 
                    `${loginAttempts} tentativas de login falharam. Verifique suas permissões.`}
                </p>
              )}
              
              {debugMessage && (
                <div className="mt-4 p-2 bg-gray-100 rounded text-xs font-mono text-gray-800 max-h-40 overflow-y-auto">
                  <p className="font-semibold">Depuração:</p>
                  {debugMessage.split('\n').map((line, i) => (
                    line ? <div key={i} className="whitespace-pre-wrap">{line}</div> : null
                  ))}
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

      {/* Registros de usuário e mensagens informativas */}
      {isRegister && email === "rodrigodev@yahoo.com" && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded-md max-w-xs shadow-lg">
          <p className="font-medium">Informação importante:</p>
          <p className="text-sm mt-1">
            Ao registrar com o email <strong>rodrigodev@yahoo.com</strong>, você 
            receberá automaticamente permissões de administrador.
          </p>
        </div>
      )}
      
      <div className="absolute bottom-2 left-2">
        <Button 
          variant="link" 
          size="sm" 
          onClick={() => setDebugMessage("")} 
          className={`text-xs ${!debugMessage ? "opacity-0" : ""}`}
        >
          Limpar depuração
        </Button>
      </div>
    </div>
  );
};

export default Login;
