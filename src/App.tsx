
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import Admin from "./pages/admin/Admin";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Reports from "./pages/admin/Reports";
import PrinterSettings from "./pages/admin/PrinterSettings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
            <Route path="/login" element={<Login />} />
            {/* Redirect to login page if no route matches */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
