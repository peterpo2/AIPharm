import { useState, useMemo, useCallback } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import CategoryFilter from './components/CategoryFilter';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ChatBot from './components/ChatBot';
import { CartProvider } from './context/CartContext';
import { ChatProvider } from './context/ChatContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { useChat } from './context/ChatContext';
import { categories, products, searchProducts, getProductsByCategory } from './data/mockData';
import { Product } from './types';

function AppContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isProductExpanded, setIsProductExpanded] = useState(false);
  const { t } = useLanguage();
  const { setIsOpen } = useChat();

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    let result: Product[] = products;

    if (searchTerm.trim()) {
      result = searchProducts(searchTerm);
    } else if (selectedCategory) {
      result = getProductsByCategory(selectedCategory);
    }

    return result;
  }, [searchTerm, selectedCategory]);

  const isDefaultView = !searchTerm.trim() && !selectedCategory;

  const displayedProducts = useMemo(() => {
    if (isDefaultView && !isProductExpanded) {
      return filteredProducts.slice(0, 4);
    }
    return filteredProducts;
  }, [filteredProducts, isDefaultView, isProductExpanded]);

  // Show hero only when no search or category is selected
  const showHero = isDefaultView;

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setSelectedCategory(null);
      setIsProductExpanded(false);
    } else {
      setSelectedCategory(null);
      setIsProductExpanded(true);
    }
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSearchTerm('');
    setIsProductExpanded(categoryId !== null);
  };

  const scrollToSection = useCallback((sectionId: string) => {
    if (typeof document === 'undefined') {
      return;
    }
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleViewProducts = useCallback(() => {
    setIsProductExpanded(true);
    scrollToSection('products');
  }, [scrollToSection]);

  const handleOpenAssistant = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const handleNavigateToCategories = useCallback(() => {
    scrollToSection('categories');
  }, [scrollToSection]);

  const handleNavigateToProducts = useCallback(() => {
    setIsProductExpanded(true);
    scrollToSection('products');
  }, [scrollToSection]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearch={handleSearch}
        searchTerm={searchTerm}
        onNavigateToCategories={handleNavigateToCategories}
        onNavigateToProducts={handleNavigateToProducts}
      />

      {showHero && (
        <HeroSection
          onViewProducts={handleViewProducts}
          onOpenAssistant={handleOpenAssistant}
        />
      )}

      <main className="container mx-auto px-4 py-8 bg-white min-h-screen">
        <section id="categories" className="scroll-mt-28">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            categories={categories}
          />
        </section>

        <section id="products" className="scroll-mt-28">
          <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isDefaultView && !isProductExpanded
                    ? t('products.featuredTitle')
                    : searchTerm
                    ? `${t('products.resultsFor')} "${searchTerm}"`
                    : selectedCategory
                    ? `${t('products.category')}: ${
                        categories.find((c) => c.id === selectedCategory)?.name ||
                        t('products.unknown')
                      }`
                    : t('products.allProducts')}
                </h2>
                <p className="mt-1 text-gray-600">
                  {isDefaultView && !isProductExpanded
                    ? t('products.featuredSubtitle')
                    : `${filteredProducts.length} ${t('products.products')}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {!isDefaultView || isProductExpanded ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                    {filteredProducts.length} {t('products.products')}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">
                    {displayedProducts.length}/{products.length} {t('products.products')}
                  </span>
                )}

                {isDefaultView && products.length > displayedProducts.length && (
                  <button
                    type="button"
                    onClick={() => setIsProductExpanded((prev) => !prev)}
                    className="inline-flex items-center rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 transition-colors duration-200 hover:bg-emerald-50"
                  >
                    {isProductExpanded ? t('products.showLess') : t('products.viewAll')}
                  </button>
                )}
              </div>
            </div>
          </div>

          <ProductGrid products={displayedProducts} isLoading={false} />
        </section>
      </main>

      <Footer />
      <CartDrawer />
      <ChatBot />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <CartProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </CartProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
