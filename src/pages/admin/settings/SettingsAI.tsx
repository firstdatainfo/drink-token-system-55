
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function SettingsAI() {
  const [loading, setLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  // Carregar chaves salvas ao iniciar
  useEffect(() => {
    const savedKeys = localStorage.getItem('ai_api_keys');
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys));
      } catch (e) {
        console.error('Erro ao carregar chaves salvas:', e);
      }
    }
  }, []);

  const aiOptions = [
    { name: "ChatGPT", id: "chatgpt", logo: "🤖", description: "Integre o ChatGPT em seu sistema" },
    { name: "Google Gemini", id: "gemini", logo: "🧠", description: "Adicione o poder do Google Gemini" },
    { name: "Anthropic Claude", id: "claude", logo: "🔍", description: "Use Claude para análises avançadas" },
    { name: "Mistral AI", id: "mistral", logo: "✨", description: "Integre o Mistral AI europeu" },
    { name: "Llama", id: "llama", logo: "🦙", description: "Meta AI open-source" },
    { name: "Cohere", id: "cohere", logo: "📚", description: "Especialista em processamento de linguagem" }
  ];

  const handleApiKeyChange = (id: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const saveApiKey = (id: string) => {
    setLoading(true);
    
    // Salvar todas as chaves no localStorage
    const updatedKeys = {
      ...apiKeys
    };
    
    localStorage.setItem('ai_api_keys', JSON.stringify(updatedKeys));
    
    // Simulação de integração
    setTimeout(() => {
      setLoading(false);
      toast.success(`Chave de API do ${id} salva com sucesso!`);
    }, 800);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Integrações de IA</h1>
        <p className="text-gray-500">
          Conecte seu sistema com diversas plataformas de Inteligência Artificial
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
                  <div className="space-y-1.5">
                    <Label htmlFor={`${ai.id}-api-key`}>API Key</Label>
                    <Input 
                      id={`${ai.id}-api-key`}
                      placeholder="sk-..." 
                      value={apiKeys[ai.id] || ''}
                      onChange={(e) => handleApiKeyChange(ai.id, e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={() => saveApiKey(ai.id)} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Salvando..." : "Salvar"}
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
