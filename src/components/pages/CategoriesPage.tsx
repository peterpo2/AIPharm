import React, { useMemo } from 'react';
import { ArrowRightCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../../context/LanguageContext';
import { Category, Product } from '../../types';
import { getCategoryDisplayName, getCategoryIcon } from '../../utils/categories';

interface CategoriesPageProps {
  categories: Category[];
  products: Product[];
  onCategorySelect: (categoryId: number | null) => void;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ categories, products, onCategorySelect }) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const categorySummaries = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        translatedName: getCategoryDisplayName(category, language),
        count: products.filter((product) => product.categoryId === category.id).length,
      })),
    [categories, language, products],
  );

  const handleCategoryClick = (categoryId: number) => {
    onCategorySelect(categoryId);
  };

  const handleViewAllProducts = () => {
    onCategorySelect(null);
    navigate('/products');
  };

  return (
    <div className="bg-gray-50 py-10">
      <div className="container mx-auto px-4 space-y-8">
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                {t('categories.title')}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl">{t('products.catalogTitle')}</h1>
              <p className="text-base text-gray-600 leading-relaxed">{t('categories.subtitle')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                {categories.length} {t('categories.title').toLowerCase()}
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
                <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden />
                {products.length} {t('products.products')}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleViewAllProducts}
              className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100"
            >
              {t('products.viewAll')}
            </button>
            <span className="text-sm text-gray-500">{t('products.categoryOverviewDescription')}</span>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('categories.title')}</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {categorySummaries.map((category) => {
                const IconComponent = getCategoryIcon(category.icon);

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryClick(category.id)}
                    className="group h-full rounded-xl border border-gray-200 bg-white p-4 text-left transition-all duration-200 hover:border-emerald-300 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors duration-200 group-hover:bg-emerald-100">
                          <IconComponent className="h-5 w-5" />
                        </span>
                        <h3 className="text-base font-semibold text-gray-900">{category.translatedName}</h3>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                        {category.count} {t('products.products')}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-gray-500 leading-relaxed">
                      {category.description}
                    </p>
                    <span className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-600 transition-transform duration-200 group-hover:translate-x-1">
                      {t('categories.viewProducts')}
                      <ArrowRightCircle className="ml-2 h-4 w-4" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CategoriesPage;
