export interface Category {
  id: number;
  name: string;
  description?: string;
  icon: string;
}

export interface Product {
  id: number;
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  categoryId: number;
  category?: Category;
  requiresPrescription: boolean;
  activeIngredient?: string;
  activeIngredientEn?: string;
  dosage?: string;
  dosageEn?: string;
  manufacturer?: string;
  manufacturerEn?: string;
  rating?: number;
  reviewCount?: number;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface ShoppingCart {
  id: number;
  userId: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
}

export interface ProductFilter {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  requiresPrescription?: boolean;
  pageNumber: number;
  pageSize: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  productId?: number;
}

export interface AssistantResponse {
  question: string;
  answer: string;
  productId?: number;
  timestamp: Date;
  disclaimer: string;
}