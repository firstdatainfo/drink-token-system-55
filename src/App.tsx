
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Checkout from "@/pages/Checkout";
import Admin from "@/pages/admin/Admin";
import Reports from "@/pages/admin/Reports";
import Categories from "@/pages/admin/Categories";
import Products from "@/pages/admin/Products";
import ProductAI from "@/pages/admin/ProductAI";
import SoldTickets from "@/pages/admin/SoldTickets";
import Configuracoes from "@/pages/admin/Configuracoes";
import PrinterSettings from "@/pages/admin/PrinterSettings";
import SettingsSicoob from "@/pages/admin/settings/SettingsSicoob";
import SettingsSicredi from "@/pages/admin/settings/SettingsSicredi";
import SettingsBancoBrasil from "@/pages/admin/settings/SettingsBancoBrasil";
import SettingsMercadoPago from "@/pages/admin/settings/SettingsMercadoPago";
import SettingsStone from "@/pages/admin/settings/SettingsStone";
import SettingsEFI from "@/pages/admin/settings/SettingsEFI";
import SettingsAI from "@/pages/admin/settings/SettingsAI";
import SettingsFiscal from "@/pages/admin/settings/SettingsFiscal";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import "@/App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/categories" element={<Categories />} />
              <Route path="/admin/products" element={<Products />} />
              <Route path="/admin/product-ai" element={<ProductAI />} />
              <Route path="/admin/sold-tickets" element={<SoldTickets />} />
              <Route path="/admin/configuracoes" element={<Configuracoes />} />
              <Route path="/admin/printer-settings" element={<PrinterSettings />} />
              <Route
                path="/admin/settings/sicoob"
                element={<SettingsSicoob />}
              />
              <Route
                path="/admin/settings/sicredi"
                element={<SettingsSicredi />}
              />
              <Route
                path="/admin/settings/banco-brasil"
                element={<SettingsBancoBrasil />}
              />
              <Route
                path="/admin/settings/mercado-pago"
                element={<SettingsMercadoPago />}
              />
              <Route path="/admin/settings/stone" element={<SettingsStone />} />
              <Route path="/admin/settings/efi" element={<SettingsEFI />} />
              <Route path="/admin/settings/ai" element={<SettingsAI />} />
              <Route
                path="/admin/settings/fiscal"
                element={<SettingsFiscal />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster richColors position="top-right" />
        </CartProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
