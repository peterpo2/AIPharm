import React, { useMemo } from 'react';
import { CheckCircle } from 'lucide-react';

import ProductGrid from '../ProductGrid';
import { useLanguage } from '../../context/LanguageContext';
import { Category, Product } from '../../types';
import { getCategoryDisplayName, getCategoryIcon } from '../../utils/categories';

interface ProductsPageProps {
  searchTerm: string;
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  filteredProducts: Product[];
  categories: Category[];
  allProducts: Product[];
}

const ProductsPage: React.FC<ProductsPageProps> = ({
  searchTerm,
  selectedCategory,
  onCategoryChange,
  filteredProducts,
  categories,
  allProducts,
}) => {
  const { t, language } = useLanguage();

  const categorySummaries = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        translatedName: getCategoryDisplayName(category, language),
        count: allProducts.filter((product) => product.categoryId === category.id).length,
      })),
    [allProducts, categories, language],
  );

  const hasActiveFilters = Boolean(searchTerm || selectedCategory);
  const selectedCategoryEntity = selectedCategory
    ? categories.find((category) => category.id === selectedCategory)
    : undefined;
  const selectedCategoryLabel = selectedCategoryEntity
    ? getCategoryDisplayName(selectedCategoryEntity, language)
    : t('products.unknown');

  const resultsTitle = searchTerm
    ? `${t('products.resultsFor')} "${searchTerm}"`
    : selectedCategory
    ? `${t('products.category')}: ${selectedCategoryLabel}`
    : t('products.allProducts');

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 space-y-10">
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('products.catalogTitle')}</h1>
            <p className="text-lg text-gray-600 leading-relaxed">{t('products.catalogDescription')}</p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
              <p className="text-sm font-semibold text-emerald-700 mb-1">{t('products.totalProductsLabel')}</p>
              <p className="text-3xl font-bold text-emerald-800">{allProducts.length}</p>
              <p className="text-sm text-emerald-700 mt-2">{t('products.categoryOverviewDescription')}</p>
            </div>

            {categorySummaries.map((category) => {
              const IconComponent = getCategoryIcon(category.icon);
              const isSelected = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onCategoryChange(category.id)}
                  className={`text-left border rounded-2xl p-6 group transition-all duration-200 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-200 shadow-md'
                      : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
                      }`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        isSelected ? 'text-emerald-700' : 'text-emerald-600'
                      }`}
                    >
                      {category.count} {t('products.products')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.translatedName}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {t('products.inCategory')} {category.translatedName}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          {(hasActiveFilters || filteredProducts.length > 0) && (
            <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{resultsTitle}</h2>
                  <p className="text-gray-600">
                    {hasActiveFilters
                      ? `${filteredProducts.length} ${t('products.products')}`
                      : t('products.categoryOverview')}
                  </p>
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => onCategoryChange(null)}
                    className="inline-flex items-center px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('products.viewAll')}
                  </button>
                )}
              </div>
            </div>
          )}

          <ProductGrid products={filteredProducts} isLoading={false} />
        </section>
      </div>
    </div>
  );
};

export default ProductsPage;
