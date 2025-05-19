
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import Admin from "./pages/admin/Admin";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Reports from "./pages/admin/Reports";
import PrinterSettings from "./pages/admin/PrinterSettings";
import Configuracoes from "./pages/admin/Configuracoes";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import SettingsAI from "./pages/admin/settings/SettingsAI";
import SettingsStone from "./pages/admin/settings/SettingsStone";
import SettingsMercadoPago from "./pages/admin/settings/SettingsMercadoPago";
import SettingsEFI from "./pages/admin/settings/SettingsEFI";
import SettingsSicoob from "./pages/admin/settings/SettingsSicoob";
import SettingsSicredi from "./pages/admin/settings/SettingsSicredi";
import SettingsBancoBrasil from "./pages/admin/settings/SettingsBancoBrasil";
import SettingsFiscal from "./pages/admin/settings/SettingsFiscal";

// Configurar o React Query com valores padrões melhores para evitar refetches excessivos
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/products" element={<Products />} />
            <Route path="/admin/categories" element={<Categories />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/printer-settings" element={<PrinterSettings />} />
            <Route path="/admin/configuracoes" element={<Configuracoes />} />
            <Route path="/admin/settings/ai" element={<SettingsAI />} />
            <Route path="/admin/settings/stone" element={<SettingsStone />} />
            <Route path="/admin/settings/mercadopago" element={<SettingsMercadoPago />} />
            <Route path="/admin/settings/efi" element={<SettingsEFI />} />
            <Route path="/admin/settings/sicoob" element={<SettingsSicoob />} />
            <Route path="/admin/settings/sicredi" element={<SettingsSicredi />} />
            <Route path="/admin/settings/bancobrasil" element={<SettingsBancoBrasil />} />
            <Route path="/admin/settings/fiscal" element={<SettingsFiscal />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
