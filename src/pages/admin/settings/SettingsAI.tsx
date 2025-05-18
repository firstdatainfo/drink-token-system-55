
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsAI() {
  const [loading, setLoading] = useState(false);

  const aiOptions = [
    { name: "ChatGPT", id: "chatgpt", logo: "🤖", description: "Integre o ChatGPT em seu sistema" },
    { name: "Google Gemini", id: "gemini", logo: "🧠", description: "Adicione o poder do Google Gemini" },
    { name: "Anthropic Claude", id: "claude", logo: "🔍", description: "Use Claude para análises avançadas" },
    { name: "Mistral AI", id: "mistral", logo: "✨", description: "Integre o Mistral AI europeu" },
    { name: "Llama", id: "llama", logo: "🦙", description: "Meta AI open-source" },
    { name: "Cohere", id: "cohere", logo: "📚", description: "Especialista em processamento de linguagem" }
  ];

  const handleConnectAI = (id: string) => {
    setLoading(true);
    
    // Simulação de integração
    setTimeout(() => {
      setLoading(false);
      toast.success(`${id} integrado com sucesso!`);
    }, 1500);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Integrações de IA</h1>
        <p className="text-gray-500">
          Conecte seu sistema com diversas plataformas de Inteligência Artificial gratuitamente
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiOptions.map((ai) => (
            <Card key={ai.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{ai.logo}</span>
                  <CardTitle>{ai.name}</CardTitle>
                </div>
                <CardDescription>{ai.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Input placeholder="API Key (opcional)" />
                  <Button 
                    onClick={() => handleConnectAI(ai.id)} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Conectando..." : "Conectar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
