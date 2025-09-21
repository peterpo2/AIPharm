import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Brain,
  Check,
  Clock,
  Filter,
  ListChecks,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Workflow,
  X,
  XCircle
} from 'lucide-react';
import {
  adminTools as initialTools,
  toolCategoryOptions,
  toolRoleOptions,
  toolStatusOptions
} from '../../data/tools';
import { AdminTool, ToolCategory, ToolRole, ToolStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ToolStatus | 'all'>('all');
  const [selectedRole, setSelectedRole] = useState<ToolRole | 'all'>('all');
  const [tools, setTools] = useState<AdminTool[]>(initialTools);
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

  const filteredTools = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return tools
      .filter((tool) => (selectedCategory === 'all' ? true : tool.category === selectedCategory))
      .filter((tool) => (selectedStatus === 'all' ? true : tool.status === selectedStatus))
      .filter((tool) => (selectedRole === 'all' ? true : tool.submittedByRole === selectedRole))
      .filter((tool) => {
        if (!term) return true;
        return (
          tool.name.toLowerCase().includes(term) ||
          tool.description.toLowerCase().includes(term) ||
          tool.tags.some((tag) => tag.toLowerCase().includes(term)) ||
          tool.id.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
  }, [tools, selectedCategory, selectedStatus, selectedRole, searchTerm]);

  const metrics = useMemo(
    () => ({
      total: tools.length,
      pending: tools.filter((tool) => tool.status === 'pending').length,
      active: tools.filter((tool) => tool.status === 'active').length,
      rejected: tools.filter((tool) => tool.status === 'rejected').length
    }),
    [tools]
  );

  const handleStatusChange = (toolId: string, status: ToolStatus) => {
    setTools((prev) =>
      prev.map((tool) =>
        tool.id === toolId
          ? {
              ...tool,
              status,
              lastUpdated: new Date().toISOString()
            }
          : tool
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

  if (!isOpen) {
    return null;
  }

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

          {toast && (
            <div className="px-8">
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 shadow-sm">
                <ShieldCheck className="h-5 w-5" />
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
            </div>
          )}

          <div className="px-8 py-6">
            <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t('admin.metrics.totalTools')}</p>
                  <p className="text-2xl font-bold text-slate-900">{metrics.total}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t('admin.metrics.pending')}</p>
                  <p className="text-2xl font-bold text-slate-900">{metrics.pending}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t('admin.metrics.active')}</p>
                  <p className="text-2xl font-bold text-slate-900">{metrics.active}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <XCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t('admin.metrics.rejected')}</p>
                  <p className="text-2xl font-bold text-slate-900">{metrics.rejected}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={t('admin.searchPlaceholder')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('admin.filters.category')}
                </label>
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value as ToolCategory | 'all')}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
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
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('admin.filters.status')}
                </label>
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value as ToolStatus | 'all')}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
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
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('admin.filters.role')}
                </label>
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedRole}
                    onChange={(event) => setSelectedRole(event.target.value as ToolRole | 'all')}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
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
                <span className="font-semibold text-slate-700">{filteredTools.length}</span>
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
              {filteredTools.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-8 py-16 text-center">
                  <AlertCircle className="h-10 w-10 text-amber-500" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{t('admin.list.noResults')}</h3>
                  <p className="mt-2 max-w-xl text-sm text-slate-500">{t('admin.empty.search')}</p>
                </div>
              )}

              {filteredTools.map((tool) => (
                <article
                  key={tool.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-lg"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-300 opacity-0 transition group-hover:opacity-100" />
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{tool.id}</span>
                        <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[tool.status]}`}>
                          <span className={`h-2 w-2 rounded-full ${statusDotStyles[tool.status]}`} />
                          {t(`admin.status.${tool.status}`)}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                          {categoryIcons[tool.category]}
                          {t(`admin.category.${tool.category}`)}
                        </span>
                        {tool.impact && (
                          <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${impactStyles[tool.impact]}`}>
                            <Sparkles className="h-3.5 w-3.5" />
                            {t(`admin.impact.${tool.impact}`)}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-3 text-2xl font-semibold text-slate-900">{tool.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{tool.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tool.tags.map((tag) => (
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
                          <p className="font-medium text-slate-700">{formatDate(tool.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            {t('admin.list.lastUpdated')}
                          </p>
                          <p className="font-medium text-slate-700">{formatDate(tool.lastUpdated)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            {t('admin.list.submittedBy')}
                          </p>
                          <p className="font-medium text-slate-700">
                            {tool.submittedBy}
                            <span className="block text-xs font-semibold text-emerald-600">
                              {t(`admin.role.${tool.submittedByRole}`)}
                            </span>
                          </p>
                        </div>
                      </div>
                      {typeof tool.usageCount === 'number' && (
                        <div className="flex items-start gap-3">
                          <BarChart3 className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              {t('admin.list.usageCount')}
                            </p>
                            <p className="font-medium text-slate-700">{tool.usageCount}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 lg:flex-row lg:items-center lg:justify-between">
                    <p className="text-sm text-slate-500">
                      {tool.reviewerNotes
                        ? tool.reviewerNotes
                        : tool.status === 'pending'
                        ? t('admin.notes.pending')
                        : ''}
                    </p>
                    {tool.status === 'pending' && (
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => handleStatusChange(tool.id, 'rejected')}
                          className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
                        >
                          <XCircle className="h-4 w-4" />
                          {t('admin.actions.reject')}
                        </button>
                        <button
                          onClick={() => handleStatusChange(tool.id, 'active')}
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
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
