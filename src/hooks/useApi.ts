import { useState, useEffect } from 'react';
import { apiClient, ApiCart, ProductFilter } from '../services/api';

// Generic hook for API calls
export function useApi<T>(apiCall: () => Promise<T>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

// Specific hooks for common API calls
export function useProducts(filter: ProductFilter = {}) {
  return useApi(() => apiClient.getProducts(filter), [JSON.stringify(filter)]);
}

export function useProduct(id: number) {
  return useApi(() => apiClient.getProduct(id), [id]);
}

export function useCategories() {
  return useApi(() => apiClient.getCategories(), []);
}

export function useCart() {
  const [data, setData] = useState<ApiCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const cart = await apiClient.getCart();
      setData(cart);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number = 1) => {
    const updatedCart = await apiClient.addToCart(productId, quantity);
    setData(updatedCart);
    return updatedCart;
  };

  const updateCartItem = async (cartItemId: number, quantity: number) => {
    const updatedCart = await apiClient.updateCartItem(cartItemId, quantity);
    setData(updatedCart);
    return updatedCart;
  };

  const removeFromCart = async (cartItemId: number) => {
    const updatedCart = await apiClient.removeFromCart(cartItemId);
    setData(updatedCart);
    return updatedCart;
  };

  const clearCart = async () => {
    const updatedCart = await apiClient.clearCart();
    setData(updatedCart);
    return updatedCart;
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return {
    cart: data,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refetch: fetchCart,
  };
}

// Hook for assistant chat
export function useAssistant() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askQuestion = async (question: string, productId?: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.askAssistant(question, productId);
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get assistant response';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { askQuestion, loading, error };
}
