
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  category_id?: number;
  image?: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Category {
  id: number;
  name: string;
}
