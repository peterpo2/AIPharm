import { useState, useMemo } from 'react';
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
import { categories, products, searchProducts, getProductsByCategory } from './data/mockData';
import { Product } from './types';

function AppContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { t } = useLanguage();

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

  // Show hero only when no search or category is selected
  const showHero = !searchTerm.trim() && !selectedCategory;

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setSelectedCategory(null);
    }
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} searchTerm={searchTerm} />

      {showHero && <HeroSection />}

      <main className="container mx-auto px-4 py-8 bg-white min-h-screen">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          categories={categories}
        />

        {/* Results header */}
        {(searchTerm || selectedCategory) && (
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm
                ? `${t('products.resultsFor')} "${searchTerm}"`
                : selectedCategory
                ? `${t('products.category')}: ${
                    categories.find((c) => c.id === selectedCategory)?.name ||
                    t('products.unknown')
                  }`
                : t('products.allProducts')}
            </h2>
            <p className="text-gray-600 flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                {filteredProducts.length} {t('products.products')}
              </span>
            </p>
          </div>
        )}

        <ProductGrid products={filteredProducts} isLoading={false} />
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
