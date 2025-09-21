import React from 'react';
import HeroSection from '../HeroSection';
import CategoryFilter from '../CategoryFilter';
import ProductGrid from '../ProductGrid';
import { useLanguage } from '../../context/LanguageContext';
import { Category, Product } from '../../types';

interface HomePageProps {
  searchTerm: string;
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  filteredProducts: Product[];
  categories: Category[];
  showHero: boolean;
}

const HomePage: React.FC<HomePageProps> = ({
  searchTerm,
  selectedCategory,
  onCategoryChange,
  filteredProducts,
  categories,
  showHero
}) => {
  const { t } = useLanguage();

  const resultsTitle = searchTerm
    ? `${t('products.resultsFor')} "${searchTerm}"`
    : selectedCategory
    ? `${t('products.category')}: ${
        categories.find((category) => category.id === selectedCategory)?.name ||
        t('products.unknown')
      }`
    : t('products.allProducts');

  return (
    <div className="bg-gray-50">
      {showHero && <HeroSection />}

      <main className="container mx-auto px-4 py-8 bg-white min-h-screen">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          categories={categories}
        />

        {(searchTerm || selectedCategory) && (
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{resultsTitle}</h2>
            <p className="text-gray-600 flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                {filteredProducts.length} {t('products.products')}
              </span>
            </p>
          </div>
        )}

        <ProductGrid products={filteredProducts} isLoading={false} />
      </main>
    </div>
  );
};

export default HomePage;
