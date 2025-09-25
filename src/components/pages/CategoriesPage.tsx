import React, { useEffect, useMemo, useState } from 'react';
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

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(categorySummaries[0]?.id ?? null);

  useEffect(() => {
    if (categorySummaries.length === 0) {
      setActiveCategoryId(null);
      return;
    }

    if (!activeCategoryId || !categorySummaries.some((category) => category.id === activeCategoryId)) {
      setActiveCategoryId(categorySummaries[0].id);
    }
  }, [activeCategoryId, categorySummaries]);

  const activeCategory = activeCategoryId
    ? categorySummaries.find((category) => category.id === activeCategoryId)
    : undefined;

  const handleCategoryClick = (categoryId: number) => {
    setActiveCategoryId(categoryId);
    onCategorySelect(categoryId);
  };

  const handleViewAllProducts = () => {
    onCategorySelect(null);
    navigate('/products');
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr] xl:gap-10">
          <aside className="flex flex-col gap-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:sticky lg:top-24 lg:h-fit">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                {t('categories.title')}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 lg:text-[2.5rem] lg:leading-[1.1]">
                {t('products.catalogTitle')}
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed">{t('categories.subtitle')}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                {categories.length} {t('categories.title').toLowerCase()}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-sky-700">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" aria-hidden />
                {products.length} {t('products.products')}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleViewAllProducts}
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100"
              >
                {t('products.viewAll')}
              </button>
              <button
                type="button"
                onClick={() => activeCategory && handleCategoryClick(activeCategory.id)}
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-emerald-300 hover:text-emerald-700"
              >
                {t('categories.viewProducts')}
              </button>
            </div>

            <nav className="-mx-2 -mb-2 flex flex-col gap-1 overflow-y-auto pr-1 text-left">
              {categorySummaries.map((category) => {
                const IconComponent = getCategoryIcon(category.icon);
                const isActive = category.id === activeCategoryId;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategoryId(category.id)}
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        isActive ? 'bg-emerald-500/90 text-white' : 'bg-white text-emerald-600'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                    </span>
                    <div className="flex flex-1 items-center justify-between gap-4">
                      <span className="font-semibold">{category.translatedName}</span>
                      <span className={`text-[0.65rem] font-semibold uppercase tracking-wide ${isActive ? 'text-emerald-50' : 'text-emerald-600'}`}>
                        {category.count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="space-y-6">
            {activeCategory && (
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex flex-1 items-start gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      {(() => {
                        const IconComponent = getCategoryIcon(activeCategory.icon);
                        return <IconComponent className="h-6 w-6" />;
                      })()}
                    </span>
                    <div className="space-y-3">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{activeCategory.translatedName}</h2>
                        <p className="text-sm text-gray-600 leading-relaxed">{activeCategory.description}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide">
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                          {activeCategory.count} {t('products.products')}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" aria-hidden />
                          {t('products.categoryOverviewDescription')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => handleCategoryClick(activeCategory.id)}
                      className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                    >
                      {t('categories.viewProducts')}
                    </button>
                    <button
                      type="button"
                      onClick={handleViewAllProducts}
                      className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-6 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-emerald-300 hover:text-emerald-700"
                    >
                      {t('products.viewAll')}
                      <ArrowRightCircle className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('products.catalogDescription')}</h3>
                  <p className="text-sm text-gray-500">{t('products.categoryOverview')}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {categorySummaries.map((category) => {
                  const IconComponent = getCategoryIcon(category.icon);
                  const isActive = category.id === activeCategoryId;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setActiveCategoryId(category.id)}
                      className={`flex h-full flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                        isActive
                          ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                          <IconComponent className="h-5 w-5" />
                        </span>
                        <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-600">
                          {category.count} {t('products.products')}
                        </span>
                      </div>
                      <div className="mt-4 space-y-2">
                        <h4 className="text-base font-semibold text-gray-900">{category.translatedName}</h4>
                        <p className="text-xs text-gray-500 line-clamp-3">{category.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
