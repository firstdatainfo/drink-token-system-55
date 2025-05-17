
import { Category, Product } from "@/types";

export const categories: Category[] = [
  { id: 1, name: "Cervejas" },
  { id: 2, name: "Drinks" },
  { id: 3, name: "Refrigerantes" },
  { id: 4, name: "Água" },
];

export const products: Product[] = [
  { id: 1, name: "Cerveja Long Neck", price: 12.00, category: "Cervejas", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=200" },
  { id: 2, name: "Cerveja Lata", price: 8.00, category: "Cervejas", image: "https://images.unsplash.com/photo-1613161302947-0073f380f604?q=80&w=200" },
  { id: 3, name: "Cerveja Chopp", price: 15.00, category: "Cervejas", image: "https://images.unsplash.com/photo-1586993451228-09818021e309?q=80&w=200" },
  { id: 4, name: "Gin Tônica", price: 20.00, category: "Drinks", image: "https://images.unsplash.com/photo-1619451683597-4229a57808fa?q=80&w=200" },
  { id: 5, name: "Caipirinha", price: 18.00, category: "Drinks", image: "https://images.unsplash.com/photo-1595981234058-a9302fb97adb?q=80&w=200" },
  { id: 6, name: "Coca-Cola", price: 6.00, category: "Refrigerantes", image: "https://images.unsplash.com/photo-1629203432180-71e9b18d855c?q=80&w=200" },
  { id: 7, name: "Guaraná", price: 6.00, category: "Refrigerantes", image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?q=80&w=200" },
  { id: 8, name: "Água Mineral", price: 5.00, category: "Água", image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=200" },
  { id: 9, name: "Água com Gás", price: 6.00, category: "Água", image: "https://images.unsplash.com/photo-1618283040347-c24f6215e574?q=80&w=200" },
];
