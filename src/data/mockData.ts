
import { Category, Product } from "@/types";

export const categories: Category[] = [
  { id: 1, name: "Cervejas" },
  { id: 2, name: "Drinks" },
  { id: 3, name: "Refrigerantes" },
  { id: 4, name: "Água" },
];

export const products: Product[] = [
  { id: 1, name: "Cerveja Long Neck", price: 12.00, category: "Cervejas", image: "placeholder.svg" },
  { id: 2, name: "Cerveja Lata", price: 8.00, category: "Cervejas", image: "placeholder.svg" },
  { id: 3, name: "Cerveja Chopp", price: 15.00, category: "Cervejas", image: "placeholder.svg" },
  { id: 4, name: "Gin Tônica", price: 20.00, category: "Drinks", image: "placeholder.svg" },
  { id: 5, name: "Caipirinha", price: 18.00, category: "Drinks", image: "placeholder.svg" },
  { id: 6, name: "Coca-Cola", price: 6.00, category: "Refrigerantes", image: "placeholder.svg" },
  { id: 7, name: "Guaraná", price: 6.00, category: "Refrigerantes", image: "placeholder.svg" },
  { id: 8, name: "Água Mineral", price: 5.00, category: "Água", image: "placeholder.svg" },
  { id: 9, name: "Água com Gás", price: 6.00, category: "Água", image: "placeholder.svg" },
];
