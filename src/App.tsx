import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ChatBot from './components/ChatBot';
import { CartProvider } from './context/CartContext';
import { ChatProvider } from './context/ChatContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { categories, products, searchProducts, getProductsByCategory } from './data/mockData';
import { Product } from './types';
import HomePage from './components/pages/HomePage';
import ProductsPage from './components/pages/ProductsPage';
import CategoriesPage from './components/pages/CategoriesPage';
import Services from './components/pages/Services';
import AboutUs from './components/pages/AboutUs';
import Contacts from './components/pages/Contacts';
import Promotions from './components/pages/Promotions';
import FAQ from './components/pages/FAQ';

function AppContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (location.pathname === '/categories') {
      setSearchTerm('');
      setSelectedCategory(null);
    }
  }, [location.pathname]);

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

  // Show hero only when no search or category is selected
  const showHero = isDefaultView;

  const handleNavigateToCategories = () => {
    setSearchTerm('');
    setSelectedCategory(null);

    if (location.pathname !== '/categories') {
      navigate('/categories');
    }
  };

  const handleNavigateToProducts = () => {
    setSelectedCategory(null);
    setSearchTerm('');

    if (location.pathname !== '/products') {
      navigate('/products');
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      setSelectedCategory(null);
      if (location.pathname !== '/' && location.pathname !== '/products') {
        navigate('/products');
      }
    } else {
      setSelectedCategory(null);
    }
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSearchTerm('');
    if (categoryId && location.pathname !== '/products') {
      navigate('/products');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        onSearch={handleSearch}
        searchTerm={searchTerm}
        onNavigateToCategories={handleNavigateToCategories}
        onNavigateToProducts={handleNavigateToProducts}
      />
      <div className="flex-1">
        <Routes>
          <Route
            path="/"
            element={(
              <HomePage
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                filteredProducts={filteredProducts}
                categories={categories}
                showHero={showHero}
                allProducts={products}
              />
            )}
          />
          <Route
            path="/categories"
            element={(
              <CategoriesPage
                categories={categories}
                products={products}
                onCategorySelect={handleCategoryChange}
              />
            )}
          />
          <Route
            path="/products"
            element={(
              <ProductsPage
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                filteredProducts={filteredProducts}
                categories={categories}
                allProducts={products}
              />
            )}
          />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

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
