import React, { useMemo } from 'react';
import { ArrowUpRight, CheckCircle } from 'lucide-react';

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
      <div className="container mx-auto px-4">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr] xl:gap-10">
          <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                {t('products.catalogTitle')}
              </span>
              <h1 className="mt-3 text-3xl font-bold text-gray-900 lg:text-[2.5rem] lg:leading-[1.1]">
                {t('products.catalogDescription')}
              </h1>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{t('products.categoryOverviewDescription')}</p>

              <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-semibold">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                  <p className="text-emerald-700">{t('products.totalProductsLabel')}</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-800">{allProducts.length}</p>
                </div>
                <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3">
                  <p className="text-sky-700">{t('products.category')}</p>
                  <p className="mt-1 text-2xl font-bold text-sky-800">{categories.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  {t('products.category')}
                </h2>
                <button
                  type="button"
                  onClick={() => onCategoryChange(null)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    selectedCategory === null
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-transparent text-gray-500 hover:border-emerald-300 hover:text-emerald-700'
                  }`}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  {t('products.viewAll')}
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {categorySummaries.map((category) => {
                  const IconComponent = getCategoryIcon(category.icon);
                  const isSelected = selectedCategory === category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => onCategoryChange(category.id)}
                      className={`group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                        isSelected
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm'
                          : 'border-transparent bg-gray-50 text-gray-600 hover:border-emerald-200 hover:bg-white hover:text-emerald-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                            isSelected ? 'bg-emerald-500 text-white' : 'bg-white text-emerald-600'
                          }`}
                        >
                          <IconComponent className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="font-semibold leading-tight">{category.translatedName}</p>
                          <p className="text-xs text-gray-500 group-hover:text-emerald-600">
                            {t('products.inCategory')} {category.translatedName}
                          </p>
                        </div>
                      </div>
                      <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-600">
                        {category.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    {t('products.catalogTitle')}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-gray-900 lg:text-3xl">{resultsTitle}</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    {hasActiveFilters
                      ? `${filteredProducts.length} ${t('products.products')}`
                      : t('products.categoryOverview')}
                  </p>
                </div>

                {selectedCategoryEntity && (
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    {(() => {
                      const IconComponent = getCategoryIcon(selectedCategoryEntity.icon);
                      return (
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600">
                          <IconComponent className="h-5 w-5" />
                        </span>
                      );
                    })()}
                    <div>
                      <p className="font-semibold text-gray-900">{selectedCategoryLabel}</p>
                      <p className="text-xs text-gray-500">
                        {t('products.inCategory')} {selectedCategoryLabel}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => onCategoryChange(null)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-emerald-300 hover:text-emerald-700"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {t('products.viewAll')}
                </button>
              )}
            </div>

            <ProductGrid
              products={filteredProducts}
              isLoading={false}
              onEmptyAction={() => onCategoryChange(null)}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
