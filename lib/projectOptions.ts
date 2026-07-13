import {
  AudienceType,
  CRMInternalPriority,
  CRMStatus,
  CooperationNeed,
  CooperationPriority,
  InvestmentStage,
  PlacementType,
  Project,
  ProjectPrice,
  ProjectStatus,
  ReadinessKey,
} from '@/types/project';

export const PROJECT_CATEGORIES = [
  'Образование',
  'Финансы',
  'ИИ',
  'Медицина',
  'Игры',
  'Соцсети',
  'Инструменты',
  'Туризм',
  'Транспорт и логистика',
  'Промышленность',
  'Энергетика',
  'Сельское хозяйство',
  'Строительство',
  'Экология',
  'Культура и медиа',
  'Торговля и услуги',
  'Государственные сервисы',
  'Другое',
] as const;

export const PRICE_OPTIONS: ProjectPrice[] = [
  'free',
  'freemium',
  'trial',
  'paid',
];

export const STATUS_OPTIONS: ProjectStatus[] = [
  'developing',
  'completed',
  'paused',
];

export const INVESTMENT_STAGE_OPTIONS: InvestmentStage[] = [
  'pre_seed',
  'seed',
  'startup',
  'growth',
  'expansion',
  'exit',
];

export const AUDIENCE_TYPE_OPTIONS: AudienceType[] = [
  'b2b',
  'b2c',
  'b2g',
];

export const PLACEMENT_TYPE_OPTIONS: PlacementType[] = [
  'saas',
  'on_premise',
];

export function getPlacementTypes(
  project: Pick<Project, 'placement_type' | 'placement_types'>,
): PlacementType[] {
  if (project.placement_types?.length) {
    return project.placement_types;
  }

  return project.placement_type ? [project.placement_type] : ['saas'];
}

export const COMMUNITY_STATUSES = [
  'Ищу ментора',
  'Продаю проект',
  'В поиске сооснователя',
  'Беру на стажировку',
  'Ищу инвестиции',
  'Набираю людей в команду',
  'Хочу максимальную прожарку',
  'Ищу партнерства и коллабы',
] as const;

export const READINESS_OPTIONS: ReadinessKey[] = [
  'mvp',
  'pilot',
  'users',
  'revenue',
  'team',
  'deck',
  'unit_economics',
  'gtm',
  'legal',
];

export const COOPERATION_NEED_OPTIONS: CooperationNeed[] = [
  'investment',
  'pilot',
  'cofounder',
  'mentor',
  'sales_partner',
  'tech_partner',
  'distribution_partner',
];

export const COOPERATION_PRIORITY_OPTIONS: CooperationPriority[] = [
  'now',
  'soon',
  'later',
];

export const CRM_PRIORITY_OPTIONS: CRMInternalPriority[] = [
  'low',
  'medium',
  'high',
];

export const CRM_STATUS_OPTIONS: CRMStatus[] = [
  'internal_review',
  'ready_for_showcase',
];

export const TEAM_ROLE_SUGGESTIONS = [
  'CEO',
  'COO',
  'CTO',
  'CPO',
  'CMO',
  'Founder',
  'Co-founder',
  'Product Manager',
  'Designer',
  'Developer',
  'Sales',
  'BizDev',
] as const;

export const priceLabels: Record<ProjectPrice, string> = {
  free: 'Бесплатно',
  freemium: 'Бесплатно + платные функции',
  trial: 'Пробный период',
  paid: 'Платно',
};

export const statusLabels: Record<ProjectStatus, string> = {
  developing: 'В разработке',
  completed: 'Завершён',
  paused: 'На паузе',
};

export const investmentStageLabels: Record<InvestmentStage, string> = {
  pre_seed: 'Pre-seed',
  seed: 'Seed',
  startup: 'Startup',
  growth: 'Growth',
  expansion: 'Expansion',
  exit: 'Exit',
};

export const investmentStageDescriptions: Record<InvestmentStage, string> = {
  pre_seed:
    'Предпосевная стадия: идея, гипотеза, ранний прототип или MVP. Цель — проверить проблему, аудиторию и базовую бизнес-модель.',
  seed:
    'Посевная стадия: есть рабочий продукт, первые клиенты, тестирование спроса и подготовка к росту.',
  startup:
    'Стадия запуска: проект выходит на рынок, появляются первые стабильные продажи, команда и маркетинг.',
  growth:
    'Стадия роста: усиливаются продажи, масштабируется команда, появляются повторяемые процессы.',
  expansion:
    'Стадия расширения: выход на новые рынки, масштабирование процессов и партнёрств.',
  exit:
    'Стадия выхода: продажа компании, IPO или другой формат выхода основателей и инвесторов.',
};

export const audienceTypeLabels: Record<AudienceType, string> = {
  b2b: 'B2B',
  b2c: 'B2C',
  b2g: 'B2G',
};

export const placementTypeLabels: Record<PlacementType, string> = {
  saas: 'SaaS',
  on_premise: 'On-premise',
};

export const readinessLabels: Record<ReadinessKey, string> = {
  mvp: 'Есть MVP',
  pilot: 'Есть пилот',
  users: 'Есть пользователи',
  revenue: 'Есть выручка',
  team: 'Собрана команда',
  deck: 'Есть презентация',
  unit_economics: 'Есть юнит-экономика',
  gtm: 'Есть GTM-стратегия',
  legal: 'Есть юридическая готовность',
};

export const cooperationNeedLabels: Record<CooperationNeed, string> = {
  investment: 'Ищу инвестиции',
  pilot: 'Ищу пилот',
  cofounder: 'Ищу сооснователя',
  mentor: 'Ищу ментора',
  sales_partner: 'Ищу sales-партнёра',
  tech_partner: 'Ищу tech-партнёра',
  distribution_partner: 'Ищу дистрибуционного партнёра',
};

export const cooperationPriorityLabels: Record<CooperationPriority, string> = {
  now: 'Сейчас',
  soon: 'Скоро',
  later: 'Позже',
};

export const crmPriorityLabels: Record<CRMInternalPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

export const crmStatusLabels: Record<CRMStatus, string> = {
  internal_review: 'Внутренний просмотр',
  ready_for_showcase: 'Готов к показу',
};
