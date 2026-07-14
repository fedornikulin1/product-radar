import 'server-only';

import {
  AudienceType,
  CRMInternalPriority,
  CRMStatus,
  InvestmentStage,
  PlacementType,
  Project,
  ProjectFormData,
  ProjectPrice,
  ProjectStatus,
} from '@/types/project';

type BitrixResponse<T> = {
  result?: T;
  error?: string;
  error_description?: string;
  total?: number;
  next?: number;
};

type BitrixSyncResult = {
  dealId: number;
  companyId?: number;
};

type BitrixDeal = Record<string, unknown> & {
  ID?: string;
  TITLE?: string;
  COMMENTS?: string;
  COMPANY_ID?: string;
};

type BitrixCompany = {
  ID?: string;
  TITLE?: string;
  PHONE?: Array<{ VALUE?: string }>;
  EMAIL?: Array<{ VALUE?: string }>;
  WEB?: Array<{ VALUE?: string }>;
  IM?: Array<{ VALUE?: string }>;
};

type BitrixUserField = {
  ID?: string;
  FIELD_NAME?: string;
  USER_TYPE_ID?: string;
  MULTIPLE?: string;
  LIST?: Array<{
    ID?: string;
    VALUE?: string;
    XML_ID?: string;
  }>;
};

type DealFieldDefinition = {
  code: string;
  label: string;
  type: 'string' | 'integer' | 'enumeration';
  help: string;
  multiple?: boolean;
  list?: Array<{
    value: string;
    label: string;
  }>;
};

const crmStageMap: Record<CRMStatus, string> = {
  internal_review: 'EXECUTING',
  ready_for_showcase: 'READY_TO_PUBLISH',
};

const stageCrmMap: Record<string, CRMStatus> = {
  NEW: 'internal_review',
  EXECUTING: 'internal_review',
  READY_TO_PUBLISH: 'ready_for_showcase',
  APOLOGY: 'internal_review',
};

const fieldPrefix = 'UF_CRM_PR_';
let cachedDealFieldMap: Map<string, BitrixUserField> | null = null;

const dealFieldDefinitions: DealFieldDefinition[] = [
  { code: 'SITE_ID', label: 'ID проекта на сайте', type: 'string', help: 'Служебное поле. Не менять вручную: по нему сайт связывает сделку с карточкой проекта.' },
  { code: 'SHORT_DESCRIPTION', label: 'Краткое описание', type: 'string', help: 'Короткий текст для карточки проекта на главной странице.' },
  { code: 'FULL_DESCRIPTION', label: 'Полное описание', type: 'string', help: 'Развёрнутое описание проекта для внутренней страницы.' },
  { code: 'CATEGORIES', label: 'Категории', type: 'string', help: 'Можно указать несколько категорий через запятую. Например: ИИ, Образование.' },
  { code: 'PROJECT_STATUS', label: 'Статус проекта', type: 'enumeration', help: 'Публичный статус проекта на сайте.', list: [
    { value: 'developing', label: 'В разработке' },
    { value: 'completed', label: 'Завершён' },
    { value: 'paused', label: 'На паузе' },
  ] },
  { code: 'INVEST_STAGE', label: 'Стадия инвестирования', type: 'enumeration', help: 'Текущая стадия развития проекта.', list: [
    { value: 'pre_seed', label: 'Pre-seed' },
    { value: 'seed', label: 'Seed' },
    { value: 'startup', label: 'Startup' },
    { value: 'growth', label: 'Growth' },
    { value: 'expansion', label: 'Expansion' },
    { value: 'exit', label: 'Exit' },
  ] },
  { code: 'INVEST_AMOUNT', label: 'Запрашиваемые инвестиции', type: 'string', help: 'Какая сумма нужна проекту от инвесторов. Например: 15 млн ₽.' },
  { code: 'AUDIENCE_TYPES', label: 'Тип проекта / аудитория', type: 'enumeration', help: 'Можно выбрать несколько типов аудитории.', multiple: true, list: [
    { value: 'b2b', label: 'B2B' },
    { value: 'b2c', label: 'B2C' },
    { value: 'b2g', label: 'B2G' },
  ] },
  { code: 'PLACEMENT_TYPES', label: 'Тип размещения', type: 'enumeration', help: 'Можно выбрать SaaS, On-premise или оба варианта.', multiple: true, list: [
    { value: 'saas', label: 'SaaS' },
    { value: 'on_premise', label: 'On-premise' },
  ] },
  { code: 'PRICE', label: 'Модель оплаты', type: 'enumeration', help: 'Как проект планирует зарабатывать или предоставлять доступ.', list: [
    { value: 'free', label: 'Бесплатно' },
    { value: 'freemium', label: 'Бесплатно + платные функции' },
    { value: 'trial', label: 'Пробный период' },
    { value: 'paid', label: 'Платно' },
  ] },
  { code: 'LINK', label: 'Сайт проекта', type: 'string', help: 'Внешняя ссылка на сайт, лендинг или демо проекта.' },
  { code: 'TELEGRAM', label: 'Telegram', type: 'string', help: 'Контакт проекта: @username или ссылка на Telegram.' },
  { code: 'EMAIL', label: 'Email', type: 'string', help: 'Контактный email команды проекта.' },
  { code: 'PHONE', label: 'Телефон', type: 'string', help: 'Контактный телефон команды проекта.' },
  { code: 'PRESENTATION', label: 'Презентация', type: 'string', help: 'Ссылка на PDF/PPT/PPTX/ODP/KEY или путь к загруженному файлу.' },
  { code: 'VIDEO', label: 'Видео URL', type: 'string', help: 'Ссылка на видео проекта, например YouTube или Rutube.' },
  { code: 'COUNTRY', label: 'Страна', type: 'string', help: 'Страна проекта.' },
  { code: 'CITY', label: 'Город', type: 'string', help: 'Город или населённый пункт проекта.' },
  { code: 'TECHNOLOGIES', label: 'Технологии', type: 'string', help: 'Технологический стек или ключевые технологии проекта.' },
  { code: 'FOR_WHOM', label: 'Для кого / рынок', type: 'string', help: 'Целевая аудитория, рынок или сегмент клиентов.' },
  { code: 'PROBLEM', label: 'Проблема', type: 'string', help: 'Какую проблему решает проект.' },
  { code: 'SOLUTION', label: 'Решение', type: 'string', help: 'Как проект решает указанную проблему.' },
  { code: 'ADVANTAGES', label: 'Преимущества', type: 'string', help: 'Чем проект отличается от альтернатив.' },
  { code: 'CTA', label: 'Запрос / CTA', type: 'string', help: 'Что проект хочет получить: пилот, инвестиции, партнёра, ментора и т.д.' },
  { code: 'ADDITIONAL', label: 'Дополнительно', type: 'string', help: 'Любая дополнительная информация по проекту.' },
  { code: 'COMMUNITY', label: 'Открытые запросы команды', type: 'string', help: 'Например: ищу инвестиции, ищу пилот, ищу ментора.' },
  { code: 'TEAM_MEMBERS', label: 'Команда проекта', type: 'string', help: 'Состав команды в свободном формате. Один участник — одна строка.' },
  { code: 'TEAM_ROLES', label: 'Открытые роли', type: 'string', help: 'Какие роли команда ищет. Можно перечислить через запятую.' },
  { code: 'READINESS_ITEMS', label: 'Чеклист готовности', type: 'string', help: 'Что уже готово у проекта: MVP, пилот, пользователи, выручка и т.д.' },
  { code: 'READINESS', label: 'Готовность, %', type: 'integer', help: 'Процент готовности проекта от 0 до 100.' },
  { code: 'COOP_NEEDS', label: 'Запросы сотрудничества', type: 'string', help: 'Какая помощь нужна проекту. Можно перечислить через запятую.' },
  { code: 'COOP_OFFER', label: 'Что предлагает проект', type: 'string', help: 'Что проект готов предложить партнёрам или инвесторам.' },
  { code: 'CRM_OWNER', label: 'Ответственный внутри CRM', type: 'string', help: 'Кто ведёт проект внутри команды.' },
  { code: 'CRM_PRIORITY', label: 'Внутренний приоритет', type: 'enumeration', help: 'Внутренний приоритет обработки проекта.', list: [
    { value: 'low', label: 'Низкий' },
    { value: 'medium', label: 'Средний' },
    { value: 'high', label: 'Высокий' },
  ] },
  { code: 'CRM_STATUS', label: 'CRM статус сайта', type: 'enumeration', help: 'Статус публикации на сайте. Готов к показу — проект виден публично.', list: [
    { value: 'internal_review', label: 'Внутренний просмотр' },
    { value: 'ready_for_showcase', label: 'Готов к показу' },
  ] },
  { code: 'CRM_NOTES', label: 'Внутренние заметки', type: 'string', help: 'Внутренние заметки по проекту. Не показываются публично.' },
  { code: 'CRM_LAST_CONTACT', label: 'Последний контакт', type: 'string', help: 'Дата или комментарий о последнем контакте с командой.' },
  { code: 'CRM_NEXT_ACTION', label: 'Следующий шаг', type: 'string', help: 'Что нужно сделать дальше по проекту.' },
];

function getFieldName(code: string) {
  return `${fieldPrefix}${code}`;
}

function bitrixLabel(value: string) {
  return {
    ru: value,
    en: value,
  };
}

function getConfig() {
  const webhookUrl = process.env.BITRIX24_WEBHOOK_URL?.trim();
  const categoryId = Number(process.env.BITRIX24_CATEGORY_ID);

  if (!webhookUrl || !Number.isInteger(categoryId) || categoryId < 0) {
    return null;
  }

  return {
    webhookUrl: webhookUrl.endsWith('/') ? webhookUrl : `${webhookUrl}/`,
    categoryId,
  };
}

async function callBitrix<T>(
  method: string,
  payload: Record<string, unknown> = {},
) {
  const config = getConfig();
  if (!config) return null;

  const response = await fetch(`${config.webhookUrl}${method}.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const data = (await response.json()) as BitrixResponse<T>;

  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.error || 'Ошибка Bitrix24');
  }

  return data.result ?? null;
}

function splitList(value?: string | string[]) {
  if (Array.isArray(value)) return value.filter(Boolean);

  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function getNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function firstMultiValue(items?: Array<{ VALUE?: string }>) {
  return items?.find((item) => item.VALUE)?.VALUE || '';
}

function formatTeamMembers(project: Project) {
  return (project.team_members || [])
    .map((member) =>
      [
        member.name,
        member.role && `роль: ${member.role}`,
        member.bio && `опыт: ${member.bio}`,
        member.telegram && `Telegram: ${member.telegram}`,
        member.linkedin && `LinkedIn: ${member.linkedin}`,
      ]
        .filter(Boolean)
        .join(' | '),
    )
    .filter(Boolean)
    .join('\n');
}

function toBitrixFieldValue(
  code: string,
  value: string | number | string[] | undefined,
  fieldMap: Map<string, BitrixUserField>,
) {
  const field = fieldMap.get(getFieldName(code));

  if (field?.USER_TYPE_ID !== 'enumeration') {
    return Array.isArray(value) ? value.join(', ') : value;
  }

  const values = Array.isArray(value)
    ? value
    : String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

  const ids = values
    .map((item) => {
      const option = field.LIST?.find(
        (listItem) => listItem.XML_ID === item || listItem.VALUE === item,
      );

      return option?.ID || item;
    })
    .filter(Boolean);

  return field.MULTIPLE === 'Y' ? ids : ids[0] || '';
}

function getProjectCompanyTitle(project: Project) {
  return project.title || 'Проект без названия';
}

function getCompanyFields(project: Project) {
  const fields: Record<string, unknown> = {
    TITLE: getProjectCompanyTitle(project),
    COMPANY_TYPE: 'CUSTOMER',
    OPENED: 'N',
    COMMENTS: [
      `Проект: ${project.title}`,
      project.short_description,
      '',
      `ID проекта на сайте: ${project.id}`,
    ]
      .filter(Boolean)
      .join('\n'),
  };

  if (project.contact_phone) {
    fields.PHONE = [{ VALUE: project.contact_phone, VALUE_TYPE: 'WORK' }];
  }

  if (project.contact_email) {
    fields.EMAIL = [{ VALUE: project.contact_email, VALUE_TYPE: 'WORK' }];
  }

  if (project.link) {
    fields.WEB = [{ VALUE: project.link, VALUE_TYPE: 'WORK' }];
  }

  if (project.telegram) {
    fields.IM = [{ VALUE: project.telegram, VALUE_TYPE: 'OTHER' }];
  }

  return fields;
}

function getDealCustomFields(
  project: Project,
  fieldMap: Map<string, BitrixUserField>,
) {
  return {
    [getFieldName('SITE_ID')]: project.id,
    [getFieldName('SHORT_DESCRIPTION')]: project.short_description,
    [getFieldName('FULL_DESCRIPTION')]: project.full_description,
    [getFieldName('CATEGORIES')]: project.categories.join(', '),
    [getFieldName('PROJECT_STATUS')]: toBitrixFieldValue('PROJECT_STATUS', project.status, fieldMap),
    [getFieldName('INVEST_STAGE')]: toBitrixFieldValue('INVEST_STAGE', project.investment_stage, fieldMap),
    [getFieldName('INVEST_AMOUNT')]: project.investment_amount || '',
    [getFieldName('AUDIENCE_TYPES')]: toBitrixFieldValue('AUDIENCE_TYPES', project.audience_types || [], fieldMap),
    [getFieldName('PLACEMENT_TYPES')]: toBitrixFieldValue('PLACEMENT_TYPES', project.placement_types || [], fieldMap),
    [getFieldName('PRICE')]: toBitrixFieldValue('PRICE', project.price, fieldMap),
    [getFieldName('LINK')]: project.link,
    [getFieldName('TELEGRAM')]: project.telegram,
    [getFieldName('EMAIL')]: project.contact_email,
    [getFieldName('PHONE')]: project.contact_phone,
    [getFieldName('PRESENTATION')]: project.presentation_url,
    [getFieldName('VIDEO')]: project.video_url,
    [getFieldName('COUNTRY')]: project.country,
    [getFieldName('CITY')]: project.city,
    [getFieldName('TECHNOLOGIES')]: project.technologies,
    [getFieldName('FOR_WHOM')]: project.for_whom,
    [getFieldName('PROBLEM')]: project.problem,
    [getFieldName('SOLUTION')]: project.solution,
    [getFieldName('ADVANTAGES')]: project.advantages,
    [getFieldName('CTA')]: project.cta,
    [getFieldName('ADDITIONAL')]: project.additional,
    [getFieldName('COMMUNITY')]: (project.community_statuses || []).join(', '),
    [getFieldName('TEAM_MEMBERS')]: formatTeamMembers(project),
    [getFieldName('TEAM_ROLES')]: (project.team_open_roles || []).join(', '),
    [getFieldName('READINESS_ITEMS')]: (project.readiness_items || []).join(', '),
    [getFieldName('READINESS')]: project.readiness_score || 0,
    [getFieldName('COOP_NEEDS')]: (project.cooperation_needs || []).join(', '),
    [getFieldName('COOP_OFFER')]: project.cooperation_offer || '',
    [getFieldName('CRM_OWNER')]: project.crm?.owner || '',
    [getFieldName('CRM_PRIORITY')]: toBitrixFieldValue('CRM_PRIORITY', project.crm?.priority || 'medium', fieldMap),
    [getFieldName('CRM_STATUS')]: toBitrixFieldValue('CRM_STATUS', project.crm?.status || 'internal_review', fieldMap),
    [getFieldName('CRM_NOTES')]: project.crm?.notes || '',
    [getFieldName('CRM_LAST_CONTACT')]: project.crm?.last_contact_at || '',
    [getFieldName('CRM_NEXT_ACTION')]: project.crm?.next_action || '',
  };
}

function getDealFields(
  project: Project,
  companyId: number | undefined,
  fieldMap: Map<string, BitrixUserField>,
) {
  const config = getConfig();
  if (!config) return null;

  const crmStatus = project.crm?.status || 'internal_review';
  const stageCode = crmStageMap[crmStatus];

  return {
    TITLE: `[Проект] ${project.title}`,
    CATEGORY_ID: config.categoryId,
    STAGE_ID: `C${config.categoryId}:${stageCode}`,
    COMPANY_ID: companyId || project.crm?.bitrix_company_id || undefined,
    SOURCE_ID: 'WEB',
    SOURCE_DESCRIPTION: 'Навигатор проектов',
    OPENED: 'N',
    COMMENTS: [
      project.short_description,
      '',
      `Категории: ${project.categories.join(', ') || 'не указаны'}`,
      `Город: ${project.city || 'не указан'}`,
      `Инвестиции: ${project.investment_amount || 'сумма уточняется'}`,
      `Готовность: ${project.readiness_score || 0}%`,
      project.contact_email && `Email: ${project.contact_email}`,
      project.contact_phone && `Телефон: ${project.contact_phone}`,
      project.telegram && `Telegram: ${project.telegram}`,
      project.link && `Сайт: ${project.link}`,
      project.presentation_url && `Презентация: ${project.presentation_url}`,
      '',
      `siteProjectId:${project.id}`,
    ]
      .filter(Boolean)
      .join('\n'),
    ADDITIONAL_INFO: project.id,
    ...getDealCustomFields(project, fieldMap),
  };
}

async function getDealUserFieldMap() {
  const fields = await callBitrix<BitrixUserField[]>(
    'crm.deal.userfield.list',
    {},
  );

  return new Map(
    (fields || [])
      .filter((field) => field.FIELD_NAME)
      .map((field) => [field.FIELD_NAME as string, field]),
  );
}

async function ensureDealUserFields() {
  if (cachedDealFieldMap) {
    return cachedDealFieldMap;
  }

  let fieldMap = await getDealUserFieldMap();

  const existingNames = new Set(
    Array.from(fieldMap.keys()),
  );

  for (const definition of dealFieldDefinitions) {
    const fieldName = getFieldName(definition.code);

    if (existingNames.has(fieldName)) {
      const existingField = fieldMap.get(fieldName);

      if (existingField?.ID) {
        await callBitrix<boolean>('crm.deal.userfield.update', {
          id: existingField.ID,
          fields: {
            EDIT_FORM_LABEL: bitrixLabel(definition.label),
            LIST_COLUMN_LABEL: bitrixLabel(definition.label),
            LIST_FILTER_LABEL: bitrixLabel(definition.label),
            HELP_MESSAGE: bitrixLabel(definition.help),
          },
        });
      }

      continue;
    }

    const fields: Record<string, unknown> = {
      FIELD_NAME: fieldName,
      USER_TYPE_ID: definition.type,
      XML_ID: fieldName,
      SORT: 500,
      MULTIPLE: definition.multiple ? 'Y' : 'N',
      MANDATORY: 'N',
      SHOW_FILTER: 'Y',
      SHOW_IN_LIST: 'Y',
      EDIT_IN_LIST: 'Y',
      IS_SEARCHABLE: 'Y',
      EDIT_FORM_LABEL: bitrixLabel(definition.label),
      LIST_COLUMN_LABEL: bitrixLabel(definition.label),
      LIST_FILTER_LABEL: bitrixLabel(definition.label),
      HELP_MESSAGE: bitrixLabel(definition.help),
      SETTINGS:
        definition.type === 'string'
          ? { ROWS: 3 }
          : definition.type === 'enumeration'
            ? {
                DISPLAY: definition.multiple ? 'CHECKBOX' : 'LIST',
                LIST_HEIGHT: definition.list?.length || 1,
                SHOW_NO_VALUE: definition.multiple ? 'N' : 'Y',
              }
            : undefined,
    };

    if (definition.type === 'enumeration') {
      fields.LIST = (definition.list || []).map((option, index) => ({
        VALUE: option.label,
        XML_ID: option.value,
        SORT: (index + 1) * 100,
        DEF: 'N',
      }));
    }

    await callBitrix<number>('crm.deal.userfield.add', {
      fields,
    });
  }

  fieldMap = await getDealUserFieldMap();
  cachedDealFieldMap = fieldMap;

  return fieldMap;
}

async function syncProjectCompany(project: Project) {
  const fields = getCompanyFields(project);

  if (project.crm?.bitrix_company_id) {
    await callBitrix<boolean>('crm.company.update', {
      id: project.crm.bitrix_company_id,
      fields,
    });

    return project.crm.bitrix_company_id;
  }

  return await callBitrix<number>('crm.company.add', { fields });
}

export async function syncProjectToBitrix(
  project: Project,
): Promise<BitrixSyncResult | null> {
  const config = getConfig();
  if (!config) return null;

  try {
    const fieldMap = await ensureDealUserFields();

    const companyId = (await syncProjectCompany(project)) || undefined;
    const fields = getDealFields(project, companyId, fieldMap);
    if (!fields) return null;

    if (project.crm?.bitrix_deal_id) {
      await callBitrix<boolean>('crm.deal.update', {
        id: project.crm.bitrix_deal_id,
        fields,
      });

      return {
        dealId: project.crm.bitrix_deal_id,
        companyId,
      };
    }

    const dealId = await callBitrix<number>('crm.deal.add', { fields });
    if (!dealId) return null;

    return {
      dealId,
      companyId,
    };
  } catch (error) {
    console.error(
      'Bitrix24 project sync failed:',
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

function parseStageId(stageId: string): CRMStatus {
  const code = stageId.includes(':') ? stageId.split(':').pop() || '' : stageId;
  return stageCrmMap[code] || 'internal_review';
}

function normalizeProjectStatus(value: string): ProjectStatus {
  return ['developing', 'completed', 'paused'].includes(value)
    ? (value as ProjectStatus)
    : 'developing';
}

function normalizeInvestmentStage(value: string): InvestmentStage {
  return ['pre_seed', 'seed', 'startup', 'growth', 'expansion', 'exit'].includes(value)
    ? (value as InvestmentStage)
    : 'pre_seed';
}

function normalizePrice(value: string): ProjectPrice {
  return ['free', 'freemium', 'trial', 'paid'].includes(value)
    ? (value as ProjectPrice)
    : 'free';
}

function normalizeAudienceTypes(value: string): AudienceType[] {
  const items = splitList(value).filter((item): item is AudienceType =>
    ['b2b', 'b2c', 'b2g'].includes(item),
  );

  return items.length ? items : ['b2b'];
}

function normalizePlacementTypes(value: string): PlacementType[] {
  const items = splitList(value).filter((item): item is PlacementType =>
    ['saas', 'on_premise'].includes(item),
  );

  return items.length ? items : ['saas'];
}

function stripProjectPrefix(title: string) {
  return title.replace(/^\[Проект\]\s*/i, '').trim();
}

function getDealString(
  deal: BitrixDeal,
  code: string,
  fieldMap?: Map<string, BitrixUserField>,
) {
  const fieldName = getFieldName(code);
  const rawValue = deal[fieldName];
  const field = fieldMap?.get(fieldName);

  if (field?.USER_TYPE_ID !== 'enumeration') {
    return Array.isArray(rawValue)
      ? rawValue.map(String).join(', ')
      : getString(rawValue);
  }

  const values = Array.isArray(rawValue) ? rawValue : [rawValue];

  return values
    .map((item) => {
      const id = String(item || '');
      const option = field.LIST?.find((listItem) => listItem.ID === id);
      return option?.XML_ID || option?.VALUE || id;
    })
    .filter(Boolean)
    .join(', ');
}

function parseTeamMembers(value: string): ProjectFormData['team_members'] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [name = '', ...parts] = line.split('|').map((part) => part.trim());

      return {
        id: `bitrix-member-${index + 1}`,
        name,
        role: parts.find((part) => part.toLowerCase().startsWith('роль:'))?.replace(/^роль:\s*/i, '') || '',
        bio: parts.find((part) => part.toLowerCase().startsWith('опыт:'))?.replace(/^опыт:\s*/i, '') || '',
        telegram: parts.find((part) => part.toLowerCase().startsWith('telegram:'))?.replace(/^telegram:\s*/i, '') || '',
        linkedin: parts.find((part) => part.toLowerCase().startsWith('linkedin:'))?.replace(/^linkedin:\s*/i, '') || '',
      };
    });
}

function normalizeCrmPriority(value: string): CRMInternalPriority {
  return ['low', 'medium', 'high'].includes(value)
    ? (value as CRMInternalPriority)
    : 'medium';
}

function normalizeCrmStatus(value: string): CRMStatus {
  return ['internal_review', 'ready_for_showcase'].includes(value)
    ? (value as CRMStatus)
    : 'internal_review';
}

export async function getProjectsFromBitrix(): Promise<ProjectFormData[]> {
  const config = getConfig();
  if (!config) return [];

  const fieldMap = await ensureDealUserFields();

  const deals = await callBitrix<BitrixDeal[]>('crm.deal.list', {
    filter: {
      CATEGORY_ID: config.categoryId,
    },
    select: [
      'ID',
      'TITLE',
      'STAGE_ID',
      'COMMENTS',
      'ADDITIONAL_INFO',
      'COMPANY_ID',
      ...dealFieldDefinitions.map(({ code }) => getFieldName(code)),
    ],
    order: {
      DATE_CREATE: 'DESC',
    },
  });

  const result: ProjectFormData[] = [];

  for (const deal of deals || []) {
    const companyId = getNumber(deal.COMPANY_ID);
    const company = companyId
      ? await callBitrix<BitrixCompany>('crm.company.get', { id: companyId })
      : null;

    const title =
      getString(deal.TITLE && stripProjectPrefix(String(deal.TITLE))) ||
      company?.TITLE ||
      '?????? ?? ???????24';
    const shortDescription = getDealString(deal, 'SHORT_DESCRIPTION', fieldMap);
    const contactEmail =
      getDealString(deal, 'EMAIL', fieldMap) || firstMultiValue(company?.EMAIL);
    const contactPhone =
      getDealString(deal, 'PHONE', fieldMap) || firstMultiValue(company?.PHONE);
    const telegram =
      getDealString(deal, 'TELEGRAM', fieldMap) || firstMultiValue(company?.IM);
    const link = getDealString(deal, 'LINK', fieldMap) || firstMultiValue(company?.WEB);
    const dealId = getNumber(deal.ID);
    const crmStatus = getDealString(deal, 'CRM_STATUS', fieldMap);

    result.push({
      title,
      short_description: shortDescription || getString(deal.COMMENTS),
      logo_url: getDealString(deal, 'LOGO', fieldMap),
      categories: splitList(getDealString(deal, 'CATEGORIES', fieldMap)),
      price: normalizePrice(getDealString(deal, 'PRICE', fieldMap)),
      link,
      telegram,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      presentation_url: getDealString(deal, 'PRESENTATION', fieldMap),
      full_description: getDealString(deal, 'FULL_DESCRIPTION', fieldMap) || shortDescription,
      for_whom: getDealString(deal, 'FOR_WHOM', fieldMap),
      problem: getDealString(deal, 'PROBLEM', fieldMap),
      solution: getDealString(deal, 'SOLUTION', fieldMap),
      advantages: getDealString(deal, 'ADVANTAGES', fieldMap),
      cta: getDealString(deal, 'CTA', fieldMap),
      additional: getDealString(deal, 'ADDITIONAL', fieldMap),
      gallery_urls: splitList(getDealString(deal, 'GALLERY', fieldMap)),
      video_url: getDealString(deal, 'VIDEO', fieldMap),
      technologies: getDealString(deal, 'TECHNOLOGIES', fieldMap),
      status: normalizeProjectStatus(getDealString(deal, 'PROJECT_STATUS', fieldMap)),
      investment_stage: normalizeInvestmentStage(getDealString(deal, 'INVEST_STAGE', fieldMap)),
      investment_amount: getDealString(deal, 'INVEST_AMOUNT', fieldMap),
      audience_types: normalizeAudienceTypes(getDealString(deal, 'AUDIENCE_TYPES', fieldMap)),
      placement_types: normalizePlacementTypes(getDealString(deal, 'PLACEMENT_TYPES', fieldMap)),
      community_statuses: splitList(getDealString(deal, 'COMMUNITY', fieldMap)),
      country: getDealString(deal, 'COUNTRY', fieldMap),
      city: getDealString(deal, 'CITY', fieldMap),
      team_members: parseTeamMembers(getDealString(deal, 'TEAM_MEMBERS', fieldMap)),
      team_open_roles: splitList(getDealString(deal, 'TEAM_ROLES', fieldMap)),
      readiness_items: splitList(getDealString(deal, 'READINESS_ITEMS', fieldMap)) as ProjectFormData['readiness_items'],
      readiness_score: getNumber(deal[getFieldName('READINESS')]),
      cooperation_needs: splitList(getDealString(deal, 'COOP_NEEDS', fieldMap)) as ProjectFormData['cooperation_needs'],
      cooperation_offer: getDealString(deal, 'COOP_OFFER', fieldMap),
      crm: {
        owner: getDealString(deal, 'CRM_OWNER', fieldMap),
        priority: normalizeCrmPriority(getDealString(deal, 'CRM_PRIORITY', fieldMap)),
        status: crmStatus ? normalizeCrmStatus(crmStatus) : parseStageId(getString(deal.STAGE_ID)),
        notes: getDealString(deal, 'CRM_NOTES', fieldMap) || `siteProjectId:${getDealString(deal, 'SITE_ID', fieldMap)}`,
        last_contact_at: getDealString(deal, 'CRM_LAST_CONTACT', fieldMap),
        next_action: getDealString(deal, 'CRM_NEXT_ACTION', fieldMap),
        bitrix_deal_id: dealId || undefined,
        bitrix_company_id: companyId || undefined,
      },
    });
  }

  return result;
}
