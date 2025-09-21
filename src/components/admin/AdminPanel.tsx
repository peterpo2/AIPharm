import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Brain,
  Check,
  Clock,
  Crown,
  Filter,
  ListChecks,
  LogIn,
  LogOut,
  MapPin,
  MonitorSmartphone,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Workflow,
  X,
  XCircle
} from 'lucide-react';
import {
  adminTools as initialRecommendations,
  adminUsers,
  toolCategoryOptions,
  toolRoleOptions,
  toolStatusOptions
} from '../../data/tools';
import { AdminTool, AdminUser, ToolCategory, ToolRole, ToolStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = 'recommendations' | 'users';

const statusStyles: Record<ToolStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  rejected: 'bg-rose-100 text-rose-700 border border-rose-200',
  disabled: 'bg-slate-100 text-slate-600 border border-slate-200'
};

const statusDotStyles: Record<ToolStatus, string> = {
  active: 'bg-emerald-500',
  pending: 'bg-amber-500',
  rejected: 'bg-rose-500',
  disabled: 'bg-slate-400'
};

const categoryIcons: Record<ToolCategory, JSX.Element> = {
  ai: <Brain className="w-4 h-4" />,
  automation: <Workflow className="w-4 h-4" />,
  analytics: <BarChart3 className="w-4 h-4" />,
  operations: <ListChecks className="w-4 h-4" />,
  compliance: <ShieldCheck className="w-4 h-4" />
};

const statusOrder: ToolStatus[] = ['pending', 'active', 'disabled', 'rejected'];

const impactStyles: Record<NonNullable<AdminTool['impact']>, string> = {
  high: 'text-emerald-700 bg-emerald-50',
  medium: 'text-amber-700 bg-amber-50',
  low: 'text-slate-600 bg-slate-100'
};

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<AdminTab>('recommendations');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ToolStatus | 'all'>('all');
  const [selectedRole, setSelectedRole] = useState<ToolRole | 'all'>('all');
  const [recommendations, setRecommendations] = useState<AdminTool[]>(initialRecommendations);
  const [toast, setToast] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredRecommendations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return recommendations
      .filter((recommendation) =>
        selectedCategory === 'all' ? true : recommendation.category === selectedCategory
      )
      .filter((recommendation) =>
        selectedStatus === 'all' ? true : recommendation.status === selectedStatus
      )
      .filter((recommendation) =>
        selectedRole === 'all' ? true : recommendation.submittedByRole === selectedRole
      )
      .filter((recommendation) => {
        if (!term) return true;
        return (
          recommendation.name.toLowerCase().includes(term) ||
          recommendation.description.toLowerCase().includes(term) ||
          recommendation.tags.some((tag) => tag.toLowerCase().includes(term)) ||
          recommendation.id.toLowerCase().includes(term)
        );
      })
      .sort(
        (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
      );
  }, [recommendations, selectedCategory, selectedStatus, selectedRole, searchTerm]);

  const recommendationMetrics = useMemo(
    () => ({
      total: recommendations.length,
      pending: recommendations.filter((recommendation) => recommendation.status === 'pending').length,
      active: recommendations.filter((recommendation) => recommendation.status === 'active').length,
      rejected: recommendations.filter((recommendation) => recommendation.status === 'rejected').length
    }),
    [recommendations]
  );

  const users = adminUsers;

  const userMetrics = useMemo(() => {
    if (!users.length) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalSales: 0,
        averageMonthly: 0,
        mostRecentLogin: null as string | null,
        topPerformer: null as AdminUser | null
      };
    }

    let totalSales = 0;
    let sumOfLastMonth = 0;
    let mostRecentLoginDate = new Date(users[0].lastLogin);
    let topPerformer = users[0];
    let activeUsers = 0;

    users.forEach((user) => {
      totalSales += user.totalSales;
      const lastRecord = user.monthlySales[user.monthlySales.length - 1];
      if (lastRecord) {
        sumOfLastMonth += lastRecord.value;
      }
      const loginDate = new Date(user.lastLogin);
      if (loginDate > mostRecentLoginDate) {
        mostRecentLoginDate = loginDate;
      }
      if (user.totalSales > topPerformer.totalSales) {
        topPerformer = user;
      }
      if (user.isActive) {
        activeUsers += 1;
      }
    });

    return {
      totalUsers: users.length,
      activeUsers,
      totalSales,
      averageMonthly: Math.round(sumOfLastMonth / users.length),
      mostRecentLogin: mostRecentLoginDate.toISOString(),
      topPerformer
    };
  }, [users]);

  const handleStatusChange = (toolId: string, status: ToolStatus) => {
    setRecommendations((prev) =>
      prev.map((recommendation) =>
        recommendation.id === toolId
          ? {
              ...recommendation,
              status,
              lastUpdated: new Date().toISOString()
            }
          : recommendation
      )
    );

    setToast({
      type: 'success',
      message: status === 'active' ? t('admin.toast.approved') : t('admin.toast.rejected')
    });
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedRole('all');
    setSearchTerm('');
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'BGN',
      maximumFractionDigits: 0
    }).format(value);

  const formatPercent = (value: number, fractionDigits = 0) =>
    new Intl.NumberFormat(undefined, {
      style: 'percent',
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits
    }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0
    }).format(value);

  const formatMonth = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat(undefined, { month: 'short' }).format(date);
  };

  if (!isOpen) {
    return null;
  }

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'recommendations', label: t('admin.tabs.recommendations') },
    { id: 'users', label: t('admin.tabs.users') }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <div className="relative w-full max-w-6xl">
        <div className="absolute inset-x-0 -top-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/90 px-4 py-1 text-sm font-semibold text-white shadow-lg">
            <ShieldCheck className="h-4 w-4" />
            {t('header.adminPanel')}
          </span>
        </div>
        <div className="rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/5">
          <div className="flex items-start justify-between border-b border-slate-100 px-8 py-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
                {t('admin.title')}
              </p>
              <h2 className="mt-1 text-3xl font-bold text-slate-900">{t('admin.subtitle')}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-8 pt-4">
            <div className="flex flex-wrap items-center gap-2 rounded-full bg-slate-100 p-1 text-sm font-semibold text-slate-500">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 rounded-full px-4 py-2 transition ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                      : 'hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {toast && activeTab === 'recommendations' && (
            <div className="px-8">
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 shadow-sm">
                <ShieldCheck className="h-5 w-5" />
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
            </div>
          )}

          {activeTab === 'recommendations' ? (
            <div className="px-8 py-6">
              <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{t('admin.metrics.totalTools')}</p>
                    <p className="text-2xl font-bold text-slate-900">{recommendationMetrics.total}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{t('admin.metrics.pending')}</p>
                    <p className="text-2xl font-bold text-slate-900">{recommendationMetrics.pending}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{t('admin.metrics.active')}</p>
                    <p className="text-2xl font-bold text-slate-900">{recommendationMetrics.active}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                    <XCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{t('admin.metrics.rejected')}</p>
                    <p className="text-2xl font-bold text-slate-900">{recommendationMetrics.rejected}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={t('admin.searchPlaceholder')}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('admin.filters.category')}
                  </label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={selectedCategory}
                      onChange={(event) => setSelectedCategory(event.target.value as ToolCategory | 'all')}
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    >
                      <option value="all">{t('admin.filters.all')}</option>
                      {toolCategoryOptions.map((category) => (
                        <option key={category.id} value={category.id}>
                          {t(category.nameKey)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('admin.filters.status')}
                  </label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={selectedStatus}
                      onChange={(event) => setSelectedStatus(event.target.value as ToolStatus | 'all')}
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    >
                      <option value="all">{t('admin.filters.all')}</option>
                      {toolStatusOptions.map((status) => (
                        <option key={status.id} value={status.id}>
                          {t(status.nameKey)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('admin.filters.role')}
                  </label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={selectedRole}
                      onChange={(event) => setSelectedRole(event.target.value as ToolRole | 'all')}
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    >
                      <option value="all">{t('admin.filters.all')}</option>
                      {toolRoleOptions.map((role) => (
                        <option key={role.id} value={role.id}>
                          {t(role.nameKey)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                <p>
                  {t('admin.list.totalLabel')}{' '}
                  <span className="font-semibold text-slate-700">{filteredRecommendations.length}</span>
                </p>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <Filter className="h-4 w-4" />
                  {t('admin.filters.reset')}
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {filteredRecommendations.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-8 py-16 text-center">
                    <AlertCircle className="h-10 w-10 text-amber-500" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">{t('admin.list.noResults')}</h3>
                    <p className="mt-2 max-w-xl text-sm text-slate-500">{t('admin.empty.search')}</p>
                  </div>
                )}

                {filteredRecommendations.map((recommendation) => (
                  <article
                    key={recommendation.id}
                    className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-lg"
                  >
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-300 opacity-0 transition group-hover:opacity-100" />
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{recommendation.id}</span>
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[recommendation.status]}`}
                          >
                            <span className={`h-2 w-2 rounded-full ${statusDotStyles[recommendation.status]}`} />
                            {t(`admin.status.${recommendation.status}`)}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                            {categoryIcons[recommendation.category]}
                            {t(`admin.category.${recommendation.category}`)}
                          </span>
                          {recommendation.impact && (
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${impactStyles[recommendation.impact]}`}
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              {t(`admin.impact.${recommendation.impact}`)}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-3 text-2xl font-semibold text-slate-900">{recommendation.name}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{recommendation.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {recommendation.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                            >
                              <Tag className="h-3 w-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="w-full max-w-sm space-y-3 rounded-2xl bg-slate-50/80 p-4 text-sm text-slate-600">
                        <div className="flex items-start gap-3">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              {t('admin.list.submittedOn')}
                            </p>
                            <p className="font-medium text-slate-700">{formatDate(recommendation.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              {t('admin.list.lastUpdated')}
                            </p>
                            <p className="font-medium text-slate-700">{formatDate(recommendation.lastUpdated)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              {t('admin.list.submittedBy')}
                            </p>
                            <p className="font-medium text-slate-700">
                              {recommendation.submittedBy}
                              <span className="block text-xs font-semibold text-emerald-600">
                                {t(`admin.role.${recommendation.submittedByRole}`)}
                              </span>
                            </p>
                          </div>
                        </div>
                        {typeof recommendation.usageCount === 'number' && (
                          <div className="flex items-start gap-3">
                            <BarChart3 className="h-4 w-4 text-slate-400" />
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                {t('admin.list.usageCount')}
                              </p>
                              <p className="font-medium text-slate-700">{recommendation.usageCount}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 lg:flex-row lg:items-center lg:justify-between">
                      <p className="text-sm text-slate-500">
                        {recommendation.reviewerNotes
                          ? recommendation.reviewerNotes
                          : recommendation.status === 'pending'
                          ? t('admin.notes.pending')
                          : ''}
                      </p>
                      {recommendation.status === 'pending' && (
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => handleStatusChange(recommendation.id, 'rejected')}
                            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
                          >
                            <XCircle className="h-4 w-4" />
                            {t('admin.actions.reject')}
                          </button>
                          <button
                            onClick={() => handleStatusChange(recommendation.id, 'active')}
                            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-100"
                          >
                            <Check className="h-4 w-4" />
                            {t('admin.actions.approve')}
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-8 py-6 space-y-6">
              <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{t('admin.users.metrics.totalUsers')}</p>
                    <p className="text-2xl font-bold text-slate-900">{userMetrics.totalUsers}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{t('admin.users.metrics.activeUsers')}</p>
                    <p className="text-2xl font-bold text-slate-900">{userMetrics.activeUsers}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{t('admin.users.metrics.teamSales')}</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(userMetrics.totalSales)}</p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <Target className="h-3 w-3 text-emerald-500" />
                      <span>{t('admin.users.metrics.averageMonthly')}</span>
                      <span className="font-semibold text-slate-700">{formatCurrency(userMetrics.averageMonthly)}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <Crown className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{t('admin.users.metrics.topPerformer')}</p>
                    {userMetrics.topPerformer ? (
                      <>
                        <p className="text-lg font-semibold text-slate-900">{userMetrics.topPerformer.fullName}</p>
                        <p className="text-sm text-slate-600">{formatCurrency(userMetrics.topPerformer.totalSales)}</p>
                      </>
                    ) : (
                      <p className="text-lg font-semibold text-slate-900">—</p>
                    )}
                    <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <Activity className="h-3 w-3" />
                      <span>{t('admin.users.metrics.lastTeamLogin')}</span>
                      <span className="font-semibold text-slate-700">
                        {userMetrics.mostRecentLogin ? formatDateTime(userMetrics.mostRecentLogin) : '—'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {users.map((user) => {
                  const lastMonthRecord = user.monthlySales[user.monthlySales.length - 1];
                  const lastMonthValue = lastMonthRecord?.value ?? 0;
                  const progressValue = user.monthlyTarget
                    ? Math.round((lastMonthValue / user.monthlyTarget) * 100)
                    : 0;
                  const progressWidth = Math.min(Math.max(progressValue, 0), 130);
                  const shareOfTeam = userMetrics.totalSales ? user.totalSales / userMetrics.totalSales : 0;
                  const normalizedShare = Math.min(Math.max(shareOfTeam, 0), 1);
                  const maxMonthlyValue = user.monthlySales.length
                    ? Math.max(...user.monthlySales.map((entry) => entry.value))
                    : 1;

                  return (
                    <div
                      key={user.id}
                      className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold text-slate-900">{user.fullName}</h3>
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {t(`admin.role.${user.role}`)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                        <div className="flex flex-col items-start gap-3 text-left sm:flex-row sm:items-center sm:text-right">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                              user.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                user.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {t(`admin.status.${user.isActive ? 'active' : 'disabled'}`)}
                          </span>
                          <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase tracking-wide">
                              {t('admin.users.card.totalSales')}
                            </p>
                            <p className="text-lg font-semibold text-slate-900">{formatCurrency(user.totalSales)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 py-4 md:grid-cols-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {t('admin.users.card.monthlyTarget')}
                          </p>
                          <p className="text-lg font-semibold text-slate-900">{formatCurrency(user.monthlyTarget)}</p>
                          <p className="mt-2 text-sm text-slate-500">
                            {t('admin.users.card.recentSales')}{' '}
                            <span className="font-semibold text-slate-700">{formatCurrency(lastMonthValue)}</span>
                          </p>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>{t('admin.users.card.targetProgress')}</span>
                              <span className="font-semibold text-slate-700">{progressValue}%</span>
                            </div>
                            <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                                style={{ width: `${progressWidth}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {t('admin.users.card.lastLogin')}
                          </p>
                          <p className="text-base font-semibold text-slate-900">{formatDateTime(user.lastLogin)}</p>
                          <div className="mt-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {t('admin.users.card.conversionRate')}
                            </p>
                            <p className="text-base font-semibold text-slate-900">{formatPercent(user.conversionRate)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {t('admin.users.card.customersServed')}
                          </p>
                          <p className="text-base font-semibold text-slate-900">{formatNumber(user.customersServed)}</p>
                          <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>{t('admin.users.card.teamShare')}</span>
                              <span className="font-semibold text-emerald-600">{formatPercent(normalizedShare, 1)}</span>
                            </div>
                            <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                              <div
                                className="h-2 rounded-full bg-emerald-500"
                                style={{ width: `${Math.max(normalizedShare * 100, 2)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-6 lg:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                            {t('admin.users.card.salesTrend')}
                          </h4>
                          <div className="mt-4 space-y-3">
                            {user.monthlySales.map((entry) => {
                              const width = Math.max((entry.value / maxMonthlyValue) * 100, 8);
                              return (
                                <div key={`${user.id}-${entry.month}`} className="flex items-center gap-3">
                                  <span className="w-16 text-xs font-medium text-slate-500">
                                    {formatMonth(entry.month)}
                                  </span>
                                  <div className="relative flex-1 h-2 rounded-full bg-slate-100">
                                    <div
                                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                                      style={{ width: `${width}%` }}
                                    />
                                  </div>
                                  <span className="w-20 text-xs font-semibold text-slate-600 text-right">
                                    {formatCurrency(entry.value)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                            {t('admin.users.card.loginActivity')}
                          </h4>
                          <div className="mt-4 space-y-3">
                            {user.loginHistory.map((event) => (
                              <div
                                key={`${user.id}-${event.timestamp}-${event.action}`}
                                className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3"
                              >
                                <div
                                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                                    event.action === 'login'
                                      ? 'bg-emerald-100 text-emerald-600'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  {event.action === 'login' ? (
                                    <LogIn className="h-4 w-4" />
                                  ) : (
                                    <LogOut className="h-4 w-4" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-slate-900">
                                    {t(`admin.users.card.action.${event.action}`)}
                                  </p>
                                  <p className="text-xs text-slate-500">{formatDateTime(event.timestamp)}</p>
                                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="h-3 w-3 text-emerald-500" />
                                      {event.location}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                      <MonitorSmartphone className="h-3 w-3 text-blue-500" />
                                      {event.device}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
