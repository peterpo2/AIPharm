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
    <div className="bg-gray-50 py-10">
      <div className="container mx-auto px-4 space-y-8">
        <section className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                {t('products.catalogTitle')}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl">{t('products.catalogDescription')}</h1>
              <p className="text-base text-gray-600">{t('products.categoryOverviewDescription')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm">
                <p className="font-semibold text-emerald-700">{t('products.totalProductsLabel')}</p>
                <p className="text-2xl font-bold text-emerald-800">{allProducts.length}</p>
              </div>
              <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm">
                <p className="font-semibold text-sky-700">{t('products.category')}</p>
                <p className="text-2xl font-bold text-sky-800">{categories.length}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
            <button
              type="button"
              onClick={() => onCategoryChange(null)}
              className={`flex h-full flex-col justify-center rounded-xl border p-4 text-left text-emerald-700 transition-all duration-200 ${
                selectedCategory === null
                  ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                  : 'border-emerald-200 bg-emerald-50 hover:border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <span className="text-sm font-semibold">{t('products.viewAll')}</span>
              <span className="mt-1 text-xs text-emerald-700">{t('products.categoryOverview')}</span>
            </button>

            {categorySummaries.map((category) => {
              const IconComponent = getCategoryIcon(category.icon);
              const isSelected = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onCategoryChange(category.id)}
                  className={`group flex h-full flex-col justify-between rounded-xl border p-4 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-emerald-600 transition-colors duration-200 ${
                        isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-50 group-hover:bg-emerald-100'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      {category.count} {t('products.products')}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <h3 className="text-base font-semibold text-gray-900">{category.translatedName}</h3>
                    <p className="text-xs text-gray-500">
                      {t('products.inCategory')} {category.translatedName}
                    </p>
                  </div>
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

          <ProductGrid
            products={filteredProducts}
            isLoading={false}
            onEmptyAction={() => onCategoryChange(null)}
          />
        </section>
      </div>
    </div>
  );
};

export default ProductsPage;
