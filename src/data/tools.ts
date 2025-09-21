import { AdminTool, ToolCategory, ToolRole, ToolStatus } from '../types';

export const toolCategoryOptions: { id: ToolCategory; nameKey: string }[] = [
  { id: 'ai', nameKey: 'admin.category.ai' },
  { id: 'automation', nameKey: 'admin.category.automation' },
  { id: 'analytics', nameKey: 'admin.category.analytics' },
  { id: 'operations', nameKey: 'admin.category.operations' },
  { id: 'compliance', nameKey: 'admin.category.compliance' }
];

export const toolStatusOptions: { id: ToolStatus; nameKey: string }[] = [
  { id: 'active', nameKey: 'admin.status.active' },
  { id: 'pending', nameKey: 'admin.status.pending' },
  { id: 'rejected', nameKey: 'admin.status.rejected' },
  { id: 'disabled', nameKey: 'admin.status.disabled' }
];

export const toolRoleOptions: { id: ToolRole; nameKey: string }[] = [
  { id: 'admin', nameKey: 'admin.role.admin' },
  { id: 'pharmacist', nameKey: 'admin.role.pharmacist' },
  { id: 'support', nameKey: 'admin.role.support' },
  { id: 'doctor', nameKey: 'admin.role.doctor' },
  { id: 'analyst', nameKey: 'admin.role.analyst' },
  { id: 'manager', nameKey: 'admin.role.manager' }
];

export const adminTools: AdminTool[] = [
  {
    id: 'TL-001',
    name: 'AI клиничен асистент',
    description:
      'AI модул за предложения за дозировка и взаимодействия на медикаменти, използван от дежурните фармацевти.',
    category: 'ai',
    status: 'active',
    submittedBy: 'Мария Димитрова',
    submittedByRole: 'pharmacist',
    createdAt: '2023-11-02T09:15:00Z',
    lastUpdated: '2024-02-14T10:40:00Z',
    tags: ['AI', 'Clinical'],
    usageCount: 482,
    impact: 'high',
    reviewerNotes: 'Одобрено за широко внедряване през февруари.'
  },
  {
    id: 'TL-002',
    name: 'Контрол на складови наличности',
    description:
      'Автоматизация на проверките за наличности и прогнози за изчерпване с интеграция към ERP системата.',
    category: 'automation',
    status: 'active',
    submittedBy: 'Иван Петров',
    submittedByRole: 'manager',
    createdAt: '2023-08-19T12:00:00Z',
    lastUpdated: '2024-01-05T08:30:00Z',
    tags: ['Automation', 'Logistics'],
    usageCount: 301,
    impact: 'high'
  },
  {
    id: 'TL-003',
    name: 'BI Панел за продажби',
    description:
      'Power BI табла за анализ на продажбите по региони, категории и промо кампании.',
    category: 'analytics',
    status: 'active',
    submittedBy: 'Георги Симеонов',
    submittedByRole: 'analyst',
    createdAt: '2024-01-12T14:10:00Z',
    lastUpdated: '2024-03-10T17:45:00Z',
    tags: ['Analytics', 'Dashboards'],
    usageCount: 198,
    impact: 'medium'
  },
  {
    id: 'TL-004',
    name: 'Мониторинг на съответствие',
    description:
      'Инструмент за следене на срокове за регулаторни отчети и автоматични напомняния към екипите.',
    category: 'compliance',
    status: 'disabled',
    submittedBy: 'София Николова',
    submittedByRole: 'admin',
    createdAt: '2023-06-04T09:00:00Z',
    lastUpdated: '2024-04-01T11:12:00Z',
    tags: ['Compliance', 'Notifications'],
    usageCount: 92,
    impact: 'medium',
    reviewerNotes: 'Поставен на пауза заради планирана миграция към нова версия.'
  },
  {
    id: 'TL-005',
    name: 'Оптимизатор на доставки',
    description:
      'AI-подпомагано планиране на доставки на медикаменти според прогнозно търсене.',
    category: 'operations',
    status: 'active',
    submittedBy: 'Даниела Христова',
    submittedByRole: 'manager',
    createdAt: '2024-02-08T07:45:00Z',
    lastUpdated: '2024-05-11T16:00:00Z',
    tags: ['Operations', 'Optimization'],
    usageCount: 128,
    impact: 'high'
  },
  {
    id: 'TL-006',
    name: 'AI подбор на терапия',
    description:
      'Предложение за AI модел, който предлага алтернативна терапия според историята на пациента.',
    category: 'ai',
    status: 'pending',
    submittedBy: 'д-р Иван Лазаров',
    submittedByRole: 'doctor',
    createdAt: '2024-05-21T10:25:00Z',
    lastUpdated: '2024-05-21T10:25:00Z',
    tags: ['AI', 'Decision Support'],
    impact: 'high',
    reviewerNotes: 'Необходима е допълнителна оценка на регулаторните изисквания.'
  },
  {
    id: 'TL-007',
    name: 'Чатбот за клиентски запитвания',
    description:
      'Предложение за автоматизиране на отговорите към клиентите в реално време чрез уеб чата.',
    category: 'automation',
    status: 'pending',
    submittedBy: 'Елена Русева',
    submittedByRole: 'support',
    createdAt: '2024-04-29T09:45:00Z',
    lastUpdated: '2024-04-29T09:45:00Z',
    tags: ['Automation', 'Customer'],
    impact: 'medium'
  },
  {
    id: 'TL-008',
    name: 'Контролен списък за фармацевти',
    description:
      'Ежедневен чеклист за фармацевтите със задължителни контролни точки и сигнализация.',
    category: 'operations',
    status: 'rejected',
    submittedBy: 'Петър Атанасов',
    submittedByRole: 'pharmacist',
    createdAt: '2023-12-18T11:30:00Z',
    lastUpdated: '2024-01-08T15:00:00Z',
    tags: ['Operations', 'Quality'],
    impact: 'low',
    reviewerNotes: 'Отхвърлено поради припокриване с вече внедрен инструмент.'
  },
  {
    id: 'TL-009',
    name: 'Анализатор на удовлетвореност',
    description:
      'Панел за следене на удовлетвореността на клиентите от AI консултациите и доставките.',
    category: 'analytics',
    status: 'pending',
    submittedBy: 'Николай Стоянов',
    submittedByRole: 'analyst',
    createdAt: '2024-06-03T13:20:00Z',
    lastUpdated: '2024-06-03T13:20:00Z',
    tags: ['Analytics', 'Customer'],
    impact: 'medium'
  },
  {
    id: 'TL-010',
    name: 'Модул за управление на инциденти',
    description:
      'Инструмент за управление на инциденти при доставки с интегрирани SLA таймери.',
    category: 'operations',
    status: 'active',
    submittedBy: 'Антония Ковачева',
    submittedByRole: 'support',
    createdAt: '2023-09-14T08:05:00Z',
    lastUpdated: '2024-03-28T09:50:00Z',
    tags: ['Operations', 'SLA'],
    usageCount: 164,
    impact: 'medium'
  }
];
