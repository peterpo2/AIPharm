import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRightCircle, Filter, Search } from 'lucide-react';
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
  const [searchValue, setSearchValue] = useState('');
  const [sortOption, setSortOption] = useState<'popular' | 'alphabetical' | 'count'>('popular');

  const filteredCategories = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    const filtered = categorySummaries.filter((category) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        category.translatedName.toLowerCase().includes(normalizedQuery) ||
        category.description?.toLowerCase().includes(normalizedQuery)
      );
    });

    const sorted = [...filtered];

    if (sortOption === 'alphabetical') {
      sorted.sort((a, b) => a.translatedName.localeCompare(b.translatedName));
    } else {
      sorted.sort((a, b) => b.count - a.count || a.translatedName.localeCompare(b.translatedName));
    }

    return sorted;
  }, [categorySummaries, searchValue, sortOption]);

  useEffect(() => {
    if (!filteredCategories.length) {
      setActiveCategoryId(null);
      return;
    }

    if (!activeCategoryId || !filteredCategories.some((category) => category.id === activeCategoryId)) {
      setActiveCategoryId(filteredCategories[0].id);
    }
  }, [activeCategoryId, filteredCategories]);

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
    <div className="bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                <Filter className="h-3.5 w-3.5" />
                {t('categories.title')}
              </span>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('products.catalogTitle')}</h1>
                <p className="text-sm text-gray-600 leading-relaxed">{t('categories.subtitle')}</p>
              </div>
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
              <button
                type="button"
                onClick={handleViewAllProducts}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-gray-600 transition-colors hover:border-emerald-300 hover:text-emerald-700"
              >
                {t('products.viewAll')}
                <ArrowRightCircle className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,260px)_1fr]">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
              <label htmlFor="categories-search" className="mb-3 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('categories.searchLabel')}
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="categories-search"
                  type="search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={t('categories.searchPlaceholder')}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('categories.sortLabel')}</p>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {[
                    { key: 'popular' as const, label: t('categories.sortPopular') },
                    { key: 'alphabetical' as const, label: t('categories.sortAlphabetical') },
                    { key: 'count' as const, label: t('categories.sortProducts') },
                  ].map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setSortOption(option.key)}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                        sortOption === option.key
                          ? 'border-emerald-300 bg-white text-emerald-700 shadow-sm'
                          : 'border-transparent bg-white/70 text-gray-600 hover:border-emerald-200 hover:bg-white hover:text-emerald-700'
                      }`}
                    >
                      <span>{option.label}</span>
                      {sortOption === option.key && <span className="text-xs font-semibold text-emerald-600">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredCategories.map((category) => {
                  const IconComponent = getCategoryIcon(category.icon);
                  const isActive = category.id === activeCategoryId;

                  return (
                    <div
                      key={category.id}
                      className={`flex h-full flex-col justify-between rounded-2xl border p-4 transition-all ${
                        isActive
                          ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          <IconComponent className="h-5 w-5" />
                        </span>
                        <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-600">
                          {category.count} {t('products.products')}
                        </span>
                      </div>
                      <div className="mt-4 space-y-2">
                        <button
                          type="button"
                          onClick={() => setActiveCategoryId(category.id)}
                          className="text-left text-base font-semibold text-gray-900 hover:text-emerald-700"
                        >
                          {category.translatedName}
                        </button>
                        <p className="text-xs text-gray-500 line-clamp-3">{category.description}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCategoryClick(category.id)}
                          className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                        >
                          {t('categories.viewProducts')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveCategoryId(category.id)}
                          className="inline-flex items-center justify-center rounded-xl border border-transparent bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 transition hover:border-emerald-200 hover:text-emerald-700"
                        >
                          {t('categories.preview')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeCategory && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex flex-1 items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        {(() => {
                          const IconComponent = getCategoryIcon(activeCategory.icon);
                          return <IconComponent className="h-5 w-5" />;
                        })()}
                      </span>
                      <div className="space-y-2">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">{activeCategory.translatedName}</h2>
                          <p className="text-sm text-gray-600 leading-relaxed">{activeCategory.description}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                            {activeCategory.count} {t('products.products')}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                            {t('products.categoryOverviewDescription')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => handleCategoryClick(activeCategory.id)}
                        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                      >
                        {t('categories.viewProducts')}
                      </button>
                      <button
                        type="button"
                        onClick={handleViewAllProducts}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-emerald-300 hover:text-emerald-700"
                      >
                        {t('products.viewAll')}
                        <ArrowRightCircle className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CategoriesPage;
