import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Ban,
  CheckCircle2,
  Loader2,
  Mail,
  Search,
  Shield,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ManagedUser {
  id: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  isAdmin: boolean;
  isDeleted: boolean;
  createdAt: string;
}

interface EditableUserFields {
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  isAdmin: boolean;
  isDeleted: boolean;
}

type ToastState = { type: 'success' | 'error'; text: string } | null;

interface UsersApiResponse {
  success?: boolean;
  message?: string;
  users?: ManagedUser[];
}

interface UpdateUserApiResponse {
  success?: boolean;
  message?: string;
  user?: ManagedUser;
}

const RAW_API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_URL_DOCKER ||
  'http://localhost:8080/api';

const API_BASE = RAW_API_BASE.replace(/\/+$/, '');

const buildUrl = (path: string) => `${API_BASE}/${path.replace(/^\/+/, '')}`;

const mapToEditable = (user: ManagedUser): EditableUserFields => ({
  email: user.email,
  fullName: user.fullName ?? '',
  phoneNumber: user.phoneNumber ?? '',
  address: user.address ?? '',
  isAdmin: user.isAdmin,
  isDeleted: user.isDeleted,
});

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const { isAdmin, user } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditableUserFields | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isAdmin) {
      return;
    }

    void fetchUsers();
  }, [fetchUsers, isAdmin, isOpen]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users
      .filter((item) => {
        if (!term) return true;
        const values = [item.email, item.fullName ?? '', item.phoneNumber ?? '', item.address ?? ''];
        return values.some((value) => value.toLowerCase().includes(term));
      })
      .sort((a, b) => {
        if (a.isDeleted === b.isDeleted) return a.email.localeCompare(b.email);
        return a.isDeleted ? 1 : -1;
      });
  }, [users, searchTerm]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!filteredUsers.length) {
      setSelectedUserId(null);
      setEditData(null);
      return;
    }

    if (!selectedUserId || !filteredUsers.some((item) => item.id === selectedUserId)) {
      const firstUser = filteredUsers[0];
      setSelectedUserId(firstUser.id);
      setEditData(mapToEditable(firstUser));
    }
  }, [filteredUsers, isOpen, selectedUserId]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onClose();
  };

  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const token =
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (!token) {
      setError(t('admin.users.errors.noSession'));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(buildUrl('users'), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      let body: UsersApiResponse | null = null;
      try {
        body = (await response.json()) as UsersApiResponse;
      } catch {
        body = null;
      }

      if (!response.ok || !body?.success) {
        throw new Error(body?.message || t('admin.users.errors.fetchFailed'));
      }

      const items: ManagedUser[] = Array.isArray(body.users) ? body.users : [];
      setUsers(items);

      if (!items.length) {
        setSelectedUserId(null);
        setEditData(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('admin.users.errors.fetchFailed');
      setError(message);
      setUsers([]);
      setSelectedUserId(null);
      setEditData(null);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const handleSelectUser = (userItem: ManagedUser) => {
    setSelectedUserId(userItem.id);
    setEditData(mapToEditable(userItem));
    setToast(null);
  };

  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editData) return;

    const { name, value, type, checked } = event.target;

    setEditData((prev) => {
      if (!prev) return prev;

      if (type === 'checkbox') {
        return { ...prev, [name]: checked };
      }

      return { ...prev, [name]: value };
    });
  };

  const selectedUser = selectedUserId
    ? users.find((item) => item.id === selectedUserId) ?? null
    : null;

  const hasChanges = useMemo(() => {
    if (!editData || !selectedUser) return false;

    const normalized = mapToEditable(selectedUser);
    return (
      normalized.email !== editData.email.trim() ||
      normalized.fullName !== editData.fullName ||
      normalized.phoneNumber !== editData.phoneNumber ||
      normalized.address !== editData.address ||
      normalized.isAdmin !== editData.isAdmin ||
      normalized.isDeleted !== editData.isDeleted
    );
  }, [editData, selectedUser]);

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString();
  };

  const resetChanges = () => {
    if (!selectedUser) return;
    setEditData(mapToEditable(selectedUser));
    setToast(null);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedUser || !editData || isSaving) {
      return;
    }

    const token =
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (!token) {
      setToast({ type: 'error', text: t('admin.users.errors.noSession') });
      return;
    }

    setIsSaving(true);
    setToast(null);

    try {
      const payload = {
        email: editData.email.trim(),
        fullName: editData.fullName.trim(),
        phoneNumber: editData.phoneNumber.trim(),
        address: editData.address.trim(),
        isAdmin: editData.isAdmin,
        isDeleted: editData.isDeleted,
      };

      const response = await fetch(buildUrl(`users/${selectedUser.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let body: UpdateUserApiResponse | null = null;
      try {
        body = (await response.json()) as UpdateUserApiResponse;
      } catch {
        body = null;
      }

      if (!response.ok || !body?.success) {
        throw new Error(body?.message || t('admin.users.errors.saveFailed'));
      }

      const updated: ManagedUser = body.user;
      setUsers((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setEditData(mapToEditable(updated));
      setSelectedUserId(updated.id);
      setToast({ type: 'success', text: body.message || t('admin.users.saveSuccess') });
    } catch (err) {
      const message = err instanceof Error ? err.message : t('admin.users.errors.saveFailed');
      setToast({ type: 'error', text: message });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !isAdmin) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60]" onClick={handleBackdropClick}>
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />
      <div className="absolute inset-0 overflow-y-auto p-4 md:p-10" onClick={handleContentClick}>
        <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 md:px-8">
            <div>
              <div className="flex items-center space-x-2 text-emerald-600">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  {t('admin.panel.title')}
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-display font-semibold text-slate-900">
                {t('admin.panel.subtitle')}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                {t('admin.panel.description')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid min-h-[420px] divide-y border-b border-slate-100 md:grid-cols-[320px,1fr] md:divide-x md:divide-y-0">
            <div className="flex flex-col space-y-5 p-6">
              <div>
                <label className="text-sm font-medium text-slate-600" htmlFor="admin-user-search">
                  {t('admin.users.searchLabel')}
                </label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="admin-user-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={t('admin.users.searchPlaceholder')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="relative flex-1 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="flex h-full flex-col items-center justify-center space-y-2 px-6 text-center text-sm text-rose-600">
                    <Ban className="h-8 w-8" />
                    <p>{error}</p>
                    <button
                      onClick={fetchUsers}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      {t('admin.users.retry')}
                    </button>
                  </div>
                ) : filteredUsers.length ? (
                  <div className="max-h-[60vh] space-y-2 overflow-y-auto p-3">
                    {filteredUsers.map((item) => {
                      const isActive = item.id === selectedUserId;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectUser(item)}
                          className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                            isActive
                              ? 'border-emerald-300 bg-white shadow-md shadow-emerald-100'
                              : 'border-transparent bg-white hover:border-emerald-200 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {item.fullName?.trim() || t('admin.users.unknownName')}
                              </p>
                              <p className="mt-1 flex items-center space-x-2 text-xs text-slate-500">
                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                <span className="break-all">{item.email}</span>
                              </p>
                            </div>
                            <div className="space-y-1 text-right">
                              {item.isAdmin && (
                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                                  <Shield className="mr-1 h-3 w-3" />
                                  {t('admin.users.badges.admin')}
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                  item.isDeleted
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {item.isDeleted
                                  ? t('admin.users.badges.deactivated')
                                  : t('admin.users.badges.active')}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center space-y-2 px-6 text-center text-sm text-slate-500">
                    <User className="h-8 w-8 text-slate-400" />
                    <p>{t('admin.users.empty')}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {selectedUser && editData ? (
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {editData.fullName.trim() || t('admin.users.unknownName')}
                      </h3>
                      <p className="text-sm text-slate-500">{editData.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {t('admin.users.memberSince').replace('{date}', formatDate(selectedUser.createdAt))}
                      </span>
                      {selectedUser.isAdmin && (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          <Shield className="mr-1 h-3.5 w-3.5" />
                          {t('admin.users.badges.admin')}
                        </span>
                      )}
                    </div>
                  </div>

                  {toast && (
                    <div
                      className={`flex items-start space-x-2 rounded-2xl border px-4 py-3 text-sm ${
                        toast.type === 'success'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                      }`}
                    >
                      {toast.type === 'success' ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4" />
                      ) : (
                        <Ban className="mt-0.5 h-4 w-4" />
                      )}
                      <span>{toast.text}</span>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-edit-email">
                        {t('admin.users.fields.email')}
                      </label>
                      <input
                        id="admin-edit-email"
                        name="email"
                        type="email"
                        required
                        value={editData.email}
                        onChange={handleFieldChange}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-edit-fullName">
                        {t('admin.users.fields.fullName')}
                      </label>
                      <input
                        id="admin-edit-fullName"
                        name="fullName"
                        value={editData.fullName}
                        onChange={handleFieldChange}
                        maxLength={150}
                        placeholder={t('admin.users.fields.fullNamePlaceholder')}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-edit-phone">
                        {t('admin.users.fields.phone')}
                      </label>
                      <input
                        id="admin-edit-phone"
                        name="phoneNumber"
                        value={editData.phoneNumber}
                        onChange={handleFieldChange}
                        maxLength={30}
                        placeholder={t('admin.users.fields.phonePlaceholder')}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-edit-address">
                        {t('admin.users.fields.address')}
                      </label>
                      <input
                        id="admin-edit-address"
                        name="address"
                        value={editData.address}
                        onChange={handleFieldChange}
                        maxLength={250}
                        placeholder={t('admin.users.fields.addressPlaceholder')}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t('admin.users.permissions.title')}
                    </label>
                    <label className="flex items-center space-x-3 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        name="isAdmin"
                        checked={editData.isAdmin}
                        onChange={handleFieldChange}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{t('admin.users.permissions.admin')}</span>
                    </label>
                    <label className="flex items-center space-x-3 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        name="isDeleted"
                        checked={editData.isDeleted}
                        onChange={handleFieldChange}
                        className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                      />
                      <span>{t('admin.users.permissions.deactivate')}</span>
                    </label>
                    {user?.id === selectedUser.id && (
                      <p className="text-xs text-amber-600">
                        {t('admin.users.permissions.selfWarning')}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={resetChanges}
                      disabled={!hasChanges || isSaving}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {t('admin.users.actions.reset')}
                    </button>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={fetchUsers}
                        disabled={isSaving}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {t('admin.users.actions.refresh')}
                      </button>
                      <button
                        type="submit"
                        disabled={!hasChanges || isSaving}
                        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSaving ? t('admin.users.actions.saving') : t('admin.users.actions.save')}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="flex h-full flex-col items-center justify-center space-y-3 text-center">
                  <User className="h-10 w-10 text-slate-300" />
                  <p className="text-sm text-slate-500">{t('admin.users.noSelection')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
