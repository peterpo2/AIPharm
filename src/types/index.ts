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

export type ToolStatus = 'active' | 'pending' | 'rejected' | 'disabled';

export type ToolCategory =
  | 'ai'
  | 'automation'
  | 'analytics'
  | 'operations'
  | 'compliance';

export type ToolRole =
  | 'admin'
  | 'pharmacist'
  | 'support'
  | 'doctor'
  | 'analyst'
  | 'manager';

export interface AdminTool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  submittedBy: string;
  submittedByRole: ToolRole;
  createdAt: string;
  lastUpdated: string;
  tags: string[];
  usageCount?: number;
  impact?: 'high' | 'medium' | 'low';
  reviewerNotes?: string;
}

export interface MonthlySalesRecord {
  month: string;
  value: number;
}

export type UserActivityAction = 'login' | 'logout';

export interface UserLoginActivity {
  timestamp: string;
  action: UserActivityAction;
  location: string;
  device: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: ToolRole;
  isActive: boolean;
  totalSales: number;
  monthlyTarget: number;
  monthlySales: MonthlySalesRecord[];
  conversionRate: number;
  customersServed: number;
  lastLogin: string;
  loginHistory: UserLoginActivity[];
}
