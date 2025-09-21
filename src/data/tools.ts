import { AdminTool, AdminUser, ToolCategory, ToolRole, ToolStatus } from '../types';

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

export const adminUsers: AdminUser[] = [
  {
    id: 'US-001',
    fullName: 'Мария Георгиева',
    email: 'admin@aipharm.bg',
    role: 'admin',
    isActive: true,
    totalSales: 102700,
    monthlyTarget: 17000,
    monthlySales: [
      { month: '2024-01-01', value: 15800 },
      { month: '2024-02-01', value: 16420 },
      { month: '2024-03-01', value: 17010 },
      { month: '2024-04-01', value: 17480 },
      { month: '2024-05-01', value: 17740 },
      { month: '2024-06-01', value: 18250 }
    ],
    conversionRate: 0.42,
    customersServed: 86,
    lastLogin: '2024-06-18T08:45:00Z',
    loginHistory: [
      { timestamp: '2024-06-18T08:45:00Z', action: 'login', location: 'Sofia, BG', device: 'Chrome · MacBook Pro' },
      { timestamp: '2024-06-17T19:10:00Z', action: 'logout', location: 'Sofia, BG', device: 'Chrome · MacBook Pro' },
      { timestamp: '2024-06-17T07:55:00Z', action: 'login', location: 'Sofia, BG', device: 'Chrome · MacBook Pro' },
      { timestamp: '2024-06-16T12:04:00Z', action: 'login', location: 'Sofia, BG', device: 'iPhone App' }
    ]
  },
  {
    id: 'US-002',
    fullName: 'Иван Петров',
    email: 'ivan.petrov@aipharm.bg',
    role: 'manager',
    isActive: true,
    totalSales: 246390,
    monthlyTarget: 42000,
    monthlySales: [
      { month: '2024-01-01', value: 38200 },
      { month: '2024-02-01', value: 39450 },
      { month: '2024-03-01', value: 40210 },
      { month: '2024-04-01', value: 41890 },
      { month: '2024-05-01', value: 42760 },
      { month: '2024-06-01', value: 43880 }
    ],
    conversionRate: 0.48,
    customersServed: 412,
    lastLogin: '2024-06-18T07:58:00Z',
    loginHistory: [
      { timestamp: '2024-06-18T07:58:00Z', action: 'login', location: 'Plovdiv, BG', device: 'Edge · Surface Pro' },
      { timestamp: '2024-06-17T21:05:00Z', action: 'logout', location: 'Plovdiv, BG', device: 'Edge · Surface Pro' },
      { timestamp: '2024-06-17T08:12:00Z', action: 'login', location: 'Plovdiv, BG', device: 'Edge · Surface Pro' },
      { timestamp: '2024-06-16T09:33:00Z', action: 'login', location: 'Plovdiv, BG', device: 'Android App' }
    ]
  },
  {
    id: 'US-003',
    fullName: 'Елена Русева',
    email: 'elena.ruseva@aipharm.bg',
    role: 'pharmacist',
    isActive: true,
    totalSales: 190650,
    monthlyTarget: 31000,
    monthlySales: [
      { month: '2024-01-01', value: 29800 },
      { month: '2024-02-01', value: 30540 },
      { month: '2024-03-01', value: 31220 },
      { month: '2024-04-01', value: 32100 },
      { month: '2024-05-01', value: 33260 },
      { month: '2024-06-01', value: 33730 }
    ],
    conversionRate: 0.52,
    customersServed: 286,
    lastLogin: '2024-06-18T09:24:00Z',
    loginHistory: [
      { timestamp: '2024-06-18T09:24:00Z', action: 'login', location: 'Sofia, BG', device: 'Safari · iPad Pro' },
      { timestamp: '2024-06-17T18:12:00Z', action: 'logout', location: 'Sofia, BG', device: 'Safari · iPad Pro' },
      { timestamp: '2024-06-17T08:11:00Z', action: 'login', location: 'Sofia, BG', device: 'Safari · iPad Pro' },
      { timestamp: '2024-06-16T14:45:00Z', action: 'login', location: 'Sofia, BG', device: 'iPhone App' }
    ]
  },
  {
    id: 'US-004',
    fullName: 'Георги Симеонов',
    email: 'georgi.simeonov@aipharm.bg',
    role: 'analyst',
    isActive: false,
    totalSales: 121180,
    monthlyTarget: 21000,
    monthlySales: [
      { month: '2024-01-01', value: 18400 },
      { month: '2024-02-01', value: 19220 },
      { month: '2024-03-01', value: 19850 },
      { month: '2024-04-01', value: 20540 },
      { month: '2024-05-01', value: 21180 },
      { month: '2024-06-01', value: 21990 }
    ],
    conversionRate: 0.37,
    customersServed: 204,
    lastLogin: '2024-06-17T18:40:00Z',
    loginHistory: [
      { timestamp: '2024-06-17T18:40:00Z', action: 'login', location: 'Varna, BG', device: 'Chrome · ThinkPad' },
      { timestamp: '2024-06-17T16:05:00Z', action: 'logout', location: 'Varna, BG', device: 'Chrome · ThinkPad' },
      { timestamp: '2024-06-17T07:35:00Z', action: 'login', location: 'Varna, BG', device: 'Chrome · ThinkPad' },
      { timestamp: '2024-06-16T17:18:00Z', action: 'login', location: 'Varna, BG', device: 'Android App' }
    ]
  },
  {
    id: 'US-005',
    fullName: 'Даниела Христова',
    email: 'daniela.hristova@aipharm.bg',
    role: 'support',
    isActive: true,
    totalSales: 142850,
    monthlyTarget: 24000,
    monthlySales: [
      { month: '2024-01-01', value: 22100 },
      { month: '2024-02-01', value: 22840 },
      { month: '2024-03-01', value: 23350 },
      { month: '2024-04-01', value: 24020 },
      { month: '2024-05-01', value: 24980 },
      { month: '2024-06-01', value: 25560 }
    ],
    conversionRate: 0.44,
    customersServed: 328,
    lastLogin: '2024-06-18T10:05:00Z',
    loginHistory: [
      { timestamp: '2024-06-18T10:05:00Z', action: 'login', location: 'Burgas, BG', device: 'Chrome · MacBook Air' },
      { timestamp: '2024-06-17T19:45:00Z', action: 'logout', location: 'Burgas, BG', device: 'Chrome · MacBook Air' },
      { timestamp: '2024-06-17T08:22:00Z', action: 'login', location: 'Burgas, BG', device: 'Chrome · MacBook Air' },
      { timestamp: '2024-06-16T09:10:00Z', action: 'login', location: 'Burgas, BG', device: 'Android App' }
    ]
  },
  {
    id: 'US-006',
    fullName: 'д-р Иван Лазаров',
    email: 'ivan.lazarov@aipharm.bg',
    role: 'doctor',
    isActive: true,
    totalSales: 171420,
    monthlyTarget: 28500,
    monthlySales: [
      { month: '2024-01-01', value: 26500 },
      { month: '2024-02-01', value: 27340 },
      { month: '2024-03-01', value: 28180 },
      { month: '2024-04-01', value: 28900 },
      { month: '2024-05-01', value: 29860 },
      { month: '2024-06-01', value: 30640 }
    ],
    conversionRate: 0.51,
    customersServed: 354,
    lastLogin: '2024-06-18T06:50:00Z',
    loginHistory: [
      { timestamp: '2024-06-18T06:50:00Z', action: 'login', location: 'Ruse, BG', device: 'Firefox · Linux' },
      { timestamp: '2024-06-17T20:15:00Z', action: 'logout', location: 'Ruse, BG', device: 'Firefox · Linux' },
      { timestamp: '2024-06-17T06:45:00Z', action: 'login', location: 'Ruse, BG', device: 'Firefox · Linux' },
      { timestamp: '2024-06-16T07:30:00Z', action: 'login', location: 'Ruse, BG', device: 'Android App' }
    ]
  }
];
