import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Category, Product, ProductPromotion } from '../types';
import { categories as defaultCategories, products as defaultProducts } from '../data/mockData';

interface InventoryContextValue {
  categories: Category[];
  products: Product[];
  addProduct: (input: CreateProductInput) => Product;
  updateProduct: (id: number, input: UpdateProductInput) => Product | null;
  upsertPromotion: (productId: number, promotion: CreatePromotionInput) => Product | null;
  removePromotion: (productId: number) => Product | null;
  searchProducts: (term: string) => Product[];
  getProductsByCategory: (categoryId: number) => Product[];
  getProductById: (id: number) => Product | undefined;
}

export type CreateProductInput = Omit<Product, 'id' | 'category'> & { id?: number };
export type UpdateProductInput = Partial<Omit<Product, 'id' | 'category'>>;
export type CreatePromotionInput = Omit<ProductPromotion, 'id'> & { id?: string };

type StoredProduct = Omit<Product, 'category'>;

const STORAGE_KEY = 'aipharm.inventory.products';

const normalizePromotion = (promotion: ProductPromotion | undefined | null): ProductPromotion | undefined => {
  if (!promotion) {
    return undefined;
  }

  const badgeColors: ProductPromotion['badgeColor'][] = ['emerald', 'blue', 'purple', 'orange', 'pink'];
  return {
    ...promotion,
    badgeColor: promotion.badgeColor && badgeColors.includes(promotion.badgeColor)
      ? promotion.badgeColor
      : undefined,
  };
};

const attachCategory = (product: StoredProduct, categories: Category[]): Product => ({
  ...product,
  promotion: normalizePromotion(product.promotion),
  category: categories.find((category) => category.id === product.categoryId),
});

const sanitizeProduct = (product: StoredProduct): StoredProduct => {
  const sanitized: StoredProduct = {
    ...product,
    promotion: normalizePromotion(product.promotion),
  };

  return sanitized;
};

const loadInitialProducts = (): StoredProduct[] => {
  if (typeof window === 'undefined') {
    return defaultProducts.map((product) => sanitizeProduct({ ...product }));
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (storedValue) {
      const parsed = JSON.parse(storedValue) as StoredProduct[];
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item) => typeof item?.id === 'number')
          .map((item) => sanitizeProduct({ ...item }));
      }
    }
  } catch (error) {
    console.warn('Unable to read stored inventory', error);
  }

  return defaultProducts.map((product) => sanitizeProduct({ ...product }));
};

const InventoryContext = createContext<InventoryContextValue | undefined>(undefined);

export const InventoryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [storedProducts, setStoredProducts] = useState<StoredProduct[]>(() => loadInitialProducts());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedProducts));
    } catch (error) {
      console.warn('Unable to persist inventory', error);
    }
  }, [storedProducts]);

  const products = useMemo(
    () => storedProducts.map((product) => attachCategory(product, defaultCategories)),
    [storedProducts],
  );

  const addProduct = useCallback(
    (input: CreateProductInput): Product => {
      const highestId = storedProducts.reduce((max, product) => Math.max(max, product.id), 0);
      const nextId = input.id && input.id > 0 ? input.id : highestId + 1;
      const storedProduct: StoredProduct = sanitizeProduct({
        ...input,
        id: nextId,
      });

      setStoredProducts((previous) => {
        const filtered = previous.filter((product) => product.id !== storedProduct.id);
        return [...filtered, storedProduct];
      });

      return attachCategory(storedProduct, defaultCategories);
    },
    [storedProducts],
  );

  const updateProduct = useCallback(
    (id: number, input: UpdateProductInput): Product | null => {
      let updatedProduct: StoredProduct | null = null;
      setStoredProducts((previous) => {
        const next = previous.map((product) => {
          if (product.id !== id) {
            return product;
          }

          updatedProduct = sanitizeProduct({
            ...product,
            ...input,
            id: product.id,
          });

          return updatedProduct;
        });

        return next;
      });

      return updatedProduct ? attachCategory(updatedProduct, defaultCategories) : null;
    },
    [],
  );

  const upsertPromotion = useCallback(
    (productId: number, promotion: CreatePromotionInput): Product | null => {
      const resolvedId = promotion.id && promotion.id.trim().length > 0
        ? promotion.id
        : `promo-${productId}-${Date.now().toString(36)}`;

      const normalized = normalizePromotion({
        id: resolvedId,
        ...promotion,
      } as ProductPromotion);

      return updateProduct(productId, {
        promotion: normalized,
      });
    },
    [updateProduct],
  );

  const removePromotion = useCallback(
    (productId: number): Product | null => updateProduct(productId, { promotion: undefined }),
    [updateProduct],
  );

  const searchProducts = useCallback(
    (term: string) => {
      const normalized = term.trim().toLowerCase();
      if (!normalized) {
        return products;
      }

      return products.filter((product) => {
        const values = [
          product.name,
          product.nameEn,
          product.description ?? '',
          product.descriptionEn ?? '',
          product.activeIngredient ?? '',
          product.activeIngredientEn ?? '',
          product.manufacturer ?? '',
          product.manufacturerEn ?? '',
          product.promotion?.title ?? '',
          product.promotion?.titleEn ?? '',
          product.promotion?.description ?? '',
          product.promotion?.descriptionEn ?? '',
        ];

        return values.some((value) => value.toLowerCase().includes(normalized));
      });
    },
    [products],
  );

  const getProductsByCategory = useCallback(
    (categoryId: number) => products.filter((product) => product.categoryId === categoryId),
    [products],
  );

  const getProductById = useCallback(
    (id: number) => products.find((product) => product.id === id),
    [products],
  );

  const value = useMemo<InventoryContextValue>(
    () => ({
      categories: defaultCategories,
      products,
      addProduct,
      updateProduct,
      upsertPromotion,
      removePromotion,
      searchProducts,
      getProductsByCategory,
      getProductById,
    }),
    [
      addProduct,
      getProductById,
      getProductsByCategory,
      products,
      removePromotion,
      searchProducts,
      upsertPromotion,
      updateProduct,
    ],
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};

export const useInventory = (): InventoryContextValue => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }

  return context;
};
