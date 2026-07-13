'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Controller,
  Resolver,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  AudienceType,
  Project,
  ProjectFormData,
  TeamMember,
} from '@/types/project';
import {
  AUDIENCE_TYPE_OPTIONS,
  COMMUNITY_STATUSES,
  COOPERATION_NEED_OPTIONS,
  CRM_PRIORITY_OPTIONS,
  CRM_STATUS_OPTIONS,
  INVESTMENT_STAGE_OPTIONS,
  PLACEMENT_TYPE_OPTIONS,
  PRICE_OPTIONS,
  PROJECT_CATEGORIES,
  READINESS_OPTIONS,
  STATUS_OPTIONS,
  TEAM_ROLE_SUGGESTIONS,
  audienceTypeLabels,
  cooperationNeedLabels,
  crmPriorityLabels,
  crmStatusLabels,
  investmentStageLabels,
  placementTypeLabels,
  priceLabels,
  readinessLabels,
  statusLabels,
} from '@/lib/projectOptions';
import { calculateProjectCompleteness } from '@/lib/projectCompleteness';

function makeClientId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const teamMemberSchema = z.object({
  id: z.string().default(''),
  name: z.string().default(''),
  role: z.string().default(''),
  bio: z.string().default(''),
  telegram: z.string().default(''),
  linkedin: z.string().default(''),
});

const crmSchema = z.object({
  owner: z.string().default(''),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z
    .enum(['internal_review', 'ready_for_showcase'])
    .default('internal_review'),
  notes: z.string().default(''),
  last_contact_at: z.string().default(''),
  next_action: z.string().default(''),
});

const schema = z.object({
  title: z.string().min(1, 'Введите название').max(25, 'Максимум 25 символов'),
  short_description: z
    .string()
    .min(1, 'Введите описание')
    .max(150, 'Максимум 150 символов'),
  logo_url: z.string().optional().default(''),
  categories: z
    .array(z.string())
    .min(1, 'Выберите хотя бы 1 категорию')
    .max(3, 'Максимум 3 категории'),
  price: z.enum(['free', 'freemium', 'trial', 'paid']),

  link: z.string().url('Введите корректную ссылку').or(z.literal('')),
  telegram: z.string().min(1, 'Telegram обязателен'),
  contact_email: z
    .string()
    .trim()
    .min(1, 'Введите email')
    .email('Введите корректный email'),
  contact_phone: z.string().optional().default(''),
  presentation_url: z
    .string()
    .refine(
      (value) =>
        value === '' ||
        value.startsWith('/uploads/') ||
        z.string().url().safeParse(value).success,
      'Введите корректную ссылку',
    ),

  full_description: z.string().min(1, 'Введите полное описание'),
  for_whom: z.string().min(1, 'Заполните поле'),
  problem: z.string().min(1, 'Заполните поле'),
  solution: z.string().min(1, 'Заполните поле'),
  advantages: z.string().min(1, 'Заполните поле'),
  cta: z.string().min(1, 'Заполните запрос'),
  additional: z.string().optional().default(''),

  gallery_urls: z
    .array(z.string())
    .max(6, 'Максимум 6 изображений')
    .default([]),
  video_url: z
    .string()
    .url('Введите корректную ссылку')
    .or(z.literal(''))
    .default(''),

  technologies: z.string().optional().default(''),

  status: z.enum(['developing', 'completed', 'paused']).default('developing'),
  investment_stage: z.enum([
    'pre_seed',
    'seed',
    'startup',
    'growth',
    'expansion',
    'exit',
  ]),
  investment_amount: z.string().optional().default(''),
  audience_types: z
    .array(z.enum(['b2b', 'b2c', 'b2g']))
    .min(1, 'Выберите хотя бы 1 тип проекта'),
  placement_types: z
    .array(z.enum(['saas', 'on_premise']))
    .min(1, 'Выберите хотя бы один тип размещения'),

  community_statuses: z.array(z.string()).default([]),

  country: z.string().optional().default(''),
  city: z.string().optional().default(''),

  team_members: z.array(teamMemberSchema).default([]),
  team_open_roles: z.array(z.string()).default([]),

  readiness_items: z
    .array(
      z.enum([
        'mvp',
        'pilot',
        'users',
        'revenue',
        'team',
        'deck',
        'unit_economics',
        'gtm',
        'legal',
      ]),
    )
    .default([]),
  readiness_score: z.number().optional(),

  cooperation_needs: z
    .array(
      z.enum([
        'investment',
        'pilot',
        'cofounder',
        'mentor',
        'sales_partner',
        'tech_partner',
        'distribution_partner',
        'other',
      ]),
    )
    .default([]),
  cooperation_offer: z.string().optional().default(''),

  crm: crmSchema.default({
    owner: '',
    priority: 'medium',
    status: 'internal_review',
    notes: '',
    last_contact_at: '',
    next_action: '',
  }),
});

type FormValues = z.infer<typeof schema>;

const COUNTRY_SUGGESTIONS = [
  'Россия',
] as const;

const CITY_SUGGESTIONS = [
  'Якутск',
  'Мирный',
  'Нерюнгри',
  'Алдан',
  'Ленск',
  'Олёкминск',
  'Вилюйск',
  'Покровск',
  'Намцы',
  'Верхоянск',
  'Тикси',
  'Усть-Нера',
  'Сунтар',
  'Нюрба',
  'Жатай',
] as const;

type Props = {
  project?: Project;
  mode?: 'create' | 'edit';
};

const emptyValues: FormValues = {
  title: '',
  short_description: '',
  logo_url: '',
  categories: [],
  price: 'free',

  link: '',
  telegram: '',
  contact_email: '',
  contact_phone: '',
  presentation_url: '',

  full_description: '',
  for_whom: '',
  problem: '',
  solution: '',
  advantages: '',
  cta: '',
  additional: '',

  gallery_urls: [],
  video_url: '',

  technologies: '',

  status: 'developing',
  investment_stage: 'pre_seed',
  investment_amount: '',
  audience_types: ['b2b'],
  placement_types: ['saas'],

  community_statuses: [],

  country: '',
  city: '',

  team_members: [],
  team_open_roles: [],

  readiness_items: [],
  readiness_score: 0,

  cooperation_needs: [],
  cooperation_offer: '',

  crm: {
    owner: '',
    priority: 'medium',
    status: 'internal_review',
    notes: '',
    last_contact_at: '',
    next_action: '',
  },
};

function normalizeProjectAudienceTypes(project?: Project): AudienceType[] {
  if (!project) return ['b2b'];

  if (Array.isArray(project.audience_types) && project.audience_types.length > 0) {
    return project.audience_types;
  }

  if (project.audience_type === 'b2b_b2c') {
    return ['b2b', 'b2c'];
  }

  if (
    project.audience_type === 'b2b' ||
    project.audience_type === 'b2c' ||
    project.audience_type === 'b2g'
  ) {
    return [project.audience_type];
  }

  return ['b2b'];
}

function normalizeTeamMembers(project?: Project): TeamMember[] {
  if (!project?.team_members?.length) return [];

  return project.team_members.map((member) => ({
    id: member.id || makeClientId(),
    name: member.name || '',
    role: member.role || '',
    bio: member.bio || '',
    telegram: member.telegram || '',
    linkedin: member.linkedin || '',
  }));
}

function mapProjectToFormValues(project?: Project): FormValues {
  if (!project) return emptyValues;

  return {
    title: project.title || '',
    short_description: project.short_description || '',
    logo_url: project.logo_url || '',
    categories: project.categories || [],
    price: project.price || 'free',

    link: project.link || '',
    telegram: project.telegram || '',
    contact_email: project.contact_email || '',
    contact_phone: project.contact_phone || '',
    presentation_url: project.presentation_url || '',

    full_description: project.full_description || '',
    for_whom: project.for_whom || '',
    problem: project.problem || '',
    solution: project.solution || '',
    advantages: project.advantages || '',
    cta: project.cta || '',
    additional: project.additional || '',

    gallery_urls: project.gallery_urls || [],
    video_url: project.video_url || '',

    technologies: project.technologies || '',

    status: project.status || 'developing',
    investment_stage: project.investment_stage || 'pre_seed',
    investment_amount: project.investment_amount || '',
    audience_types: normalizeProjectAudienceTypes(project),
    placement_types: project.placement_types?.length
      ? project.placement_types
      : [project.placement_type || 'saas'],

    community_statuses: project.community_statuses || [],

    country: project.country || '',
    city: project.city || '',

    team_members: normalizeTeamMembers(project),
    team_open_roles: project.team_open_roles || [],

    readiness_items: project.readiness_items || [],
    readiness_score: project.readiness_score || 0,

    cooperation_needs: project.cooperation_needs || [],
    cooperation_offer: project.cooperation_offer || '',

    crm: {
      owner: project.crm?.owner || '',
      priority: project.crm?.priority || 'medium',
      status:
        project.crm?.status === 'ready_for_showcase'
          ? 'ready_for_showcase'
          : 'internal_review',
      notes: project.crm?.notes || '',
      last_contact_at: project.crm?.last_contact_at || '',
      next_action: project.crm?.next_action || '',
    },
  };
}

export default function ProjectForm({ project, mode = 'create' }: Props) {
  const router = useRouter();

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingPresentation, setUploadingPresentation] = useState(false);
  const [presentationFileName, setPresentationFileName] = useState('');
  const [categoryOptions, setCategoryOptions] = useState<string[]>([...PROJECT_CATEGORIES]);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const initialValues = useMemo<FormValues>(
    () => mapProjectToFormValues(project),
    [project],
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: initialValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'team_members',
  });

  const logoUrl = useWatch({ control, name: 'logo_url' });
  const galleryUrls = useWatch({ control, name: 'gallery_urls' }) || [];
  const presentationUrl = useWatch({ control, name: 'presentation_url' });
  const hasUploadedPresentation = presentationUrl.startsWith('/uploads/');
  const watchedValues = useWatch({ control });
  const readinessScore = useMemo(
    () => calculateProjectCompleteness(watchedValues as FormValues),
    [watchedValues],
  );

  useEffect(() => {
    setValue('readiness_score', readinessScore, {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [readinessScore, setValue]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');

        if (!res.ok) return;

        const data = await res.json();
        const loadedCategories = Array.isArray(data) ? data : [];
        const projectCategories = project?.categories || [];
        setCategoryOptions(
          Array.from(new Set([...PROJECT_CATEGORIES, ...loadedCategories, ...projectCategories])),
        );
      } catch {
        setCategoryOptions([...PROJECT_CATEGORIES]);
      }
    }

    loadCategories();
  }, [project?.categories]);

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || 'Ошибка загрузки файла');
    }

    const data = await res.json();
    return data.url as string;
  }

  function validateImageFile(file: File) {
    const maxSizeMb = 10;

    if (!file.type.startsWith('image/')) {
      throw new Error('Можно загружать только изображения');
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      throw new Error(`Изображение слишком большое. Максимум ${maxSizeMb} МБ`);
    }
  }

  function validatePresentationFile(file: File) {
    const maxSizeMb = 25;
    const allowed = ['.pdf', '.ppt', '.pptx', '.odp', '.key'];
    const fileName = file.name.toLowerCase();

    if (!allowed.some((ext) => fileName.endsWith(ext))) {
      throw new Error('Поддерживаются только PDF, PPT, PPTX, ODP, KEY');
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      throw new Error(`Файл слишком большой. Максимум ${maxSizeMb} МБ`);
    }
  }

  async function handleLogoUpload(file?: File) {
    if (!file) return;

    setUploadingLogo(true);
    setSubmitError('');

    try {
      validateImageFile(file);
      const url = await uploadFile(file);
      setValue('logo_url', url, { shouldValidate: true, shouldDirty: true });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Не удалось загрузить логотип',
      );
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleGalleryUpload(filesToUpload?: FileList | null) {
    if (!filesToUpload?.length) return;

    const availableSlots = 6 - galleryUrls.length;
    const selectedFiles = Array.from(filesToUpload).slice(0, availableSlots);

    setUploadingGallery(true);
    setSubmitError('');

    try {
      selectedFiles.forEach(validateImageFile);

      const urls = await Promise.all(selectedFiles.map(uploadFile));

      setValue('gallery_urls', [...galleryUrls, ...urls], {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Не удалось загрузить изображения',
      );
    } finally {
      setUploadingGallery(false);
    }
  }

  async function handlePresentationUpload(file?: File) {
    if (!file) return;

    setUploadingPresentation(true);
    setSubmitError('');

    try {
      validatePresentationFile(file);
      const url = await uploadFile(file);
      setValue('presentation_url', url, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setPresentationFileName(file.name);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Не удалось загрузить презентацию',
      );
    } finally {
      setUploadingPresentation(false);
    }
  }

  async function onSubmit(data: FormValues) {
    setSubmitError('');

    const payload: ProjectFormData = {
      ...data,
      status: data.status || 'developing',
      team_members: (data.team_members || [])
        .filter((member) => member.name || member.role || member.bio)
        .map((member) => ({
          id: member.id || makeClientId(),
          name: member.name || '',
          role: member.role || '',
          bio: member.bio || '',
          telegram: member.telegram || '',
          linkedin: member.linkedin || '',
        })),
      team_open_roles: (data.team_open_roles || []).filter(Boolean),
      readiness_items: Array.from(new Set(data.readiness_items || [])),
      readiness_score: calculateProjectCompleteness(data),
      cooperation_needs: Array.from(new Set(data.cooperation_needs || [])),
      cooperation_offer: data.cooperation_offer || '',
      crm: {
        owner: data.crm?.owner || '',
        priority: data.crm?.priority || 'medium',
        status:
          data.crm?.status === 'ready_for_showcase'
            ? 'ready_for_showcase'
            : 'internal_review',
        notes: data.crm?.notes || '',
        last_contact_at: data.crm?.last_contact_at || '',
        next_action: data.crm?.next_action || '',
      },
    };

    const url =
      mode === 'edit' && project?.id
        ? `/api/projects/${project.id}`
        : '/api/projects';

    const method = mode === 'edit' ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setSubmitError('Ошибка сохранения проекта');
      return;
    }

    if (mode === 'edit' && project?.id) {
      router.push(`/projects/${project.id}`);
    } else {
      router.push('/');
    }

    router.refresh();
  }

  async function handleDelete() {
    if (!project?.id) return;

    const confirmed = confirm('Удалить проект? Это действие нельзя отменить.');
    if (!confirmed) return;

    const res = await fetch(`/api/projects/${project.id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      setSubmitError('Ошибка удаления проекта');
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="fade-up mx-auto max-w-6xl space-y-6 rounded-[34px] border border-white/10 bg-black/35 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-xl md:p-8"
    >
      {submitError && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-medium text-red-100">
          {submitError}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="Название"
          hint="Обязательное поле. До 25 символов."
          required
          error={errors.title?.message}
          {...register('title')}
        />

        <Input
          label="Telegram"
          hint="Обязательное поле. Можно в формате @username или ссылкой."
          required
          error={errors.telegram?.message}
          {...register('telegram')}
        />
      </div>

      <Textarea
        label="Краткое описание"
        hint="Обязательное поле. До 150 символов. Это будет видно на карточке проекта."
        required
        error={errors.short_description?.message}
        {...register('short_description')}
      />

      <div className="grid items-end gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select
              label="Статус проекта"
              hint="Показывается на карточке проекта."
              required
              error={errors.status?.message}
              value={field.value}
              onChange={field.onChange}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </Select>
          )}
        />

        <Controller
          control={control}
          name="investment_stage"
          render={({ field }) => (
            <Select
              label="Стадия инвестирования"
              hint="Текущий этап развития проекта."
              required
              error={errors.investment_stage?.message}
              value={field.value}
              onChange={field.onChange}
            >
              {INVESTMENT_STAGE_OPTIONS.map((stage) => (
                <option key={stage} value={stage}>
                  {investmentStageLabels[stage]}
                </option>
              ))}
            </Select>
          )}
        />

        <Controller
          control={control}
          name="placement_types"
          render={({ field }) => (
            <div>
              <FieldLabel
                label="Тип размещения"
                hint="Можно выбрать один или оба варианта."
                required
              />

              <div className="flex min-h-[58px] flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/35 p-2">
                {PLACEMENT_TYPE_OPTIONS.map((type) => {
                  const active = field.value.includes(type);

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        field.onChange(
                          active
                            ? field.value.filter((item) => item !== type)
                            : [...field.value, type],
                        )
                      }
                      className={
                        active
                          ? 'rounded-xl bg-[#5227FF] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#5227FF]/20'
                          : 'rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-medium text-white/65 transition hover:bg-white/20 hover:text-white'
                      }
                    >
                      {placementTypeLabels[type]}
                    </button>
                  );
                })}
              </div>

              {errors.placement_types?.message && (
                <p className="mt-2 text-sm font-medium text-red-200">
                  {errors.placement_types.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          control={control}
          name="price"
          render={({ field }) => (
            <Select
              label="Модель оплаты"
              hint="Как проект предоставляет доступ."
              required
              error={errors.price?.message}
              value={field.value}
              onChange={field.onChange}
            >
              {PRICE_OPTIONS.map((price) => (
                <option key={price} value={price}>
                  {priceLabels[price]}
                </option>
              ))}
            </Select>
          )}
        />
      </div>

      <Input
        label="Запрашиваемые инвестиции"
        hint="Например: 15 млн ₽, 300 тыс. $, сумма обсуждается."
        optional
        {...register('investment_amount')}
      />

      <Input
        label="Сайт проекта"
        hint="Необязательное поле. Если сайт есть, укажите полную ссылку, например https://example.com."
        optional
        error={errors.link?.message}
        {...register('link')}
      />

      <Controller
        control={control}
        name="audience_types"
        render={({ field }) => (
          <CheckboxGroup
            label="Тип проекта / аудитория"
            hint="Обязательное поле. Можно выбрать несколько: B2B, B2C, B2G."
            required
            options={AUDIENCE_TYPE_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            labelsMap={audienceTypeLabels}
            error={errors.audience_types?.message}
          />
        )}
      />

      <div className="grid items-start gap-5 md:grid-cols-3">
        <Input
          label="Email"
          hint="Контактный email команды проекта."
          required
          error={errors.contact_email?.message}
          {...register('contact_email')}
        />

        <Input
          label="Телефон"
          hint="Необязательное поле. Лучше в международном формате."
          optional
          error={errors.contact_phone?.message}
          {...register('contact_phone')}
        />

        <Input
          label="Видео URL"
          hint="Необязательное поле. Лучше YouTube или Rutube."
          optional
          error={errors.video_url?.message}
          {...register('video_url')}
        />
      </div>

      <div className="flex min-h-[230px] flex-col rounded-[26px] border border-white/10 bg-black/35 p-5">
        <FieldLabel
          label="Презентация"
          hint="Необязательное поле. Можно загрузить PDF/PPT/PPTX/ODP/KEY до 25 МБ или вставить прямую ссылку."
          optional
        />

        {presentationUrl ? (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
            <a
              href={presentationUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-bold text-violet-200 underline underline-offset-4"
            >
              {hasUploadedPresentation
                ? 'Открыть загруженный файл'
                : 'Открыть презентацию по ссылке'}
            </a>

            <button
              type="button"
              onClick={() => {
                setValue('presentation_url', '', {
                  shouldValidate: true,
                  shouldDirty: true,
                });
                setPresentationFileName('');
              }}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80 transition hover:bg-white/20"
            >
              {hasUploadedPresentation ? 'Удалить файл' : 'Удалить ссылку'}
            </button>
          </div>
        ) : null}

        <div className="mt-auto grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
          {hasUploadedPresentation ? (
            <div>
              <FieldLabel
                label="Файл презентации"
                hint="Файл загружен на сайт. Локальный технический путь скрыт."
                optional
              />
              <div className="flex min-h-[58px] items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-5 text-sm font-medium text-emerald-100">
                Презентация готова к сохранению
              </div>
            </div>
          ) : (
            <Input
              label="Ссылка на презентацию"
              hint="Вставьте внешнюю ссылку или загрузите файл справа."
              optional
              error={errors.presentation_url?.message}
              {...register('presentation_url')}
            />
          )}

          <div className="flex h-full flex-col">
            <FieldLabel
              label="Файл презентации"
              hint="Можно загрузить файл вместо внешней ссылки."
              optional
            />

            {presentationFileName && (
              <p className="mb-2 text-xs leading-relaxed text-white/45">
                Загружен файл: {presentationFileName}
              </p>
            )}

            <input
              id="presentation-upload"
              type="file"
              accept=".pdf,.ppt,.pptx,.odp,.key"
              disabled={uploadingPresentation}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                handlePresentationUpload(file);
              }}
              className="hidden"
            />

            <label
              htmlFor="presentation-upload"
              aria-disabled={uploadingPresentation}
              className={`mt-auto flex h-[58px] items-center justify-center rounded-2xl border px-5 text-center text-sm font-bold shadow-lg shadow-black/10 transition ${
                uploadingPresentation
                  ? 'cursor-wait border-white/10 bg-white/70 text-slate-500'
                  : 'cursor-pointer border-white/10 bg-white/95 text-slate-950 hover:bg-white'
              }`}
            >
              {uploadingPresentation
                ? 'Загружаем презентацию...'
                : hasUploadedPresentation
                  ? 'Заменить файл'
                  : 'Выбрать файл презентации'}
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-[26px] border border-white/10 bg-black/35 p-5">
        <FieldLabel
          label="Логотип"
          hint="Необязательное поле. Если логотипа нет, карточка покажет аккуратную заглушку с первой буквой проекта."
          optional
        />

        {logoUrl && (
          <Image
            src={logoUrl}
            alt="Логотип"
            width={112}
            height={112}
            unoptimized
            className="mb-4 h-28 w-28 rounded-2xl object-cover shadow-lg shadow-black/30"
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(event) => handleLogoUpload(event.target.files?.[0])}
          className="block w-full cursor-pointer rounded-2xl border border-white/10 bg-white/95 px-4 py-3 text-slate-950 file:mr-4 file:rounded-xl file:border-0 file:bg-[#5227FF] file:px-4 file:py-2 file:font-bold file:text-white"
        />

        {uploadingLogo && (
          <p className="mt-3 text-sm text-white/60">Загрузка логотипа...</p>
        )}
      </div>

      <Controller
        control={control}
        name="categories"
        render={({ field }) => (
          <CheckboxGroup
            label="Категории"
            hint="Обязательное поле. Можно выбрать до 3 категорий."
            required
            options={categoryOptions}
            value={field.value}
            max={3}
            onChange={field.onChange}
            onAddOption={(option) =>
              setCategoryOptions((currentOptions) =>
                currentOptions.includes(option)
                  ? currentOptions
                  : [...currentOptions, option],
              )
            }
            showCustomInput={showCategoryInput}
            onToggleCustomInput={() => setShowCategoryInput((value) => !value)}
            onAfterAddOption={() => setShowCategoryInput(false)}
            error={errors.categories?.message}
            searchable
            allowCustom
          />
        )}
      />

      <Textarea
        label="Полное описание"
        hint="Обязательное поле. Здесь можно подробнее описать продукт."
        required
        error={errors.full_description?.message}
        {...register('full_description')}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Textarea
          label="Для кого / рынок"
          hint="Обязательное поле. Опиши ЦА человеческим языком."
          required
          error={errors.for_whom?.message}
          {...register('for_whom')}
        />

        <Textarea
          label="Проблема"
          hint="Какую боль клиента закрывает проект."
          required
          error={errors.problem?.message}
          {...register('problem')}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Textarea
          label="Решение"
          hint="Кратко опиши, как продукт решает проблему."
          required
          error={errors.solution?.message}
          {...register('solution')}
        />

        <Textarea
          label="Преимущества"
          hint="Чем проект сильнее аналогов или текущих решений."
          required
          error={errors.advantages?.message}
          {...register('advantages')}
        />
      </div>

      <Textarea
        label="Запрос к инвесторам / партнёрам"
        hint="Что проект хочет получить: инвестиции, пилот, партнёра или экспертизу."
        required
        error={errors.cta?.message}
        {...register('cta')}
      />

      <Textarea
        label="Дополнительно"
        hint="Любая важная информация, которая не вошла в основные поля."
        optional
        error={errors.additional?.message}
        {...register('additional')}
      />

      <div className="rounded-[26px] border border-white/10 bg-black/35 p-5">
        <FieldLabel
          label="Галерея"
          hint="Необязательное поле. До 6 изображений. Рекомендуется 1200×800, JPG/PNG/WebP, до 10 МБ каждое."
          optional
        />

        {galleryUrls.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {galleryUrls.map((url, index) => (
              <div key={url} className="relative">
                <Image
                  src={url}
                  alt=""
                  width={600}
                  height={400}
                  unoptimized
                  className="h-36 w-full rounded-2xl object-cover shadow-lg shadow-black/20"
                />

                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      'gallery_urls',
                      galleryUrls.filter((_, itemIndex) => itemIndex !== index),
                      { shouldValidate: true, shouldDirty: true },
                    )
                  }
                  className="absolute right-2 top-2 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-sm transition hover:bg-red-400"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          multiple
          disabled={galleryUrls.length >= 6}
          onChange={(event) => handleGalleryUpload(event.target.files)}
          className="block w-full cursor-pointer rounded-2xl border border-white/10 bg-white/95 px-4 py-3 text-slate-950 file:mr-4 file:rounded-xl file:border-0 file:bg-[#5227FF] file:px-4 file:py-2 file:font-bold file:text-white disabled:opacity-50"
        />

        {uploadingGallery && (
          <p className="mt-3 text-sm text-white/60">Загрузка галереи...</p>
        )}
      </div>

      <div>
        <Textarea
          label="Технологии"
          hint="Необязательное поле. Например: Next.js, Node.js, PostgreSQL."
          optional
          error={errors.technologies?.message}
          {...register('technologies')}
        />
      </div>

      <section className="rounded-[26px] border border-white/10 bg-black/35 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <FieldLabel
              label="Команда проекта"
              hint="Необязательное поле. Добавь участников команды в структурированном виде."
              optional
            />
          </div>

          <button
            type="button"
            onClick={() =>
              append({
                id: makeClientId(),
                name: '',
                role: '',
                bio: '',
                telegram: '',
                linkedin: '',
              })
            }
            className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/80 transition hover:bg-white/20"
          >
            Добавить участника
          </button>
        </div>

        {fields.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/25 p-4 text-sm text-white/45">
            Пока не добавлено ни одного участника.
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-2xl border border-white/10 bg-black/30 p-4"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="text-sm font-black text-white">
                    Участник #{index + 1}
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-100 transition hover:bg-red-500/20"
                  >
                    Удалить
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Имя"
                    hint="Желательно заполнить."
                    optional
                    {...register(`team_members.${index}.name`)}
                  />

                  <div>
                    <Controller
                      control={control}
                      name={`team_members.${index}.role`}
                      render={({ field: roleField }) => (
                        <Select
                          label="Роль"
                          hint="Можно выбрать шаблонную роль или вписать вручную ниже."
                          optional
                          value={roleField.value || ''}
                          onChange={roleField.onChange}
                        >
                          <option value="">Не выбрано</option>
                          {TEAM_ROLE_SUGGESTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <Textarea
                  label="Кратко об опыте / зоне ответственности"
                  hint="Например: 7 лет в enterprise sales, отвечает за GTM."
                  optional
                  {...register(`team_members.${index}.bio`)}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Telegram"
                    hint="Необязательно."
                    optional
                    {...register(`team_members.${index}.telegram`)}
                  />

                  <Input
                    label="LinkedIn"
                    hint="Необязательно. Ссылка на профессиональный профиль участника."
                    optional
                    {...register(`team_members.${index}.linkedin`)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <Controller
          control={control}
          name="team_open_roles"
          render={({ field }) => (
            <Textarea
              label="Открытые роли в команде"
              hint="Необязательное поле. Каждая роль с новой строки."
              optional
              value={(field.value || []).join('\n')}
              onChange={(event) =>
                field.onChange(
                  event.target.value
                    .split('\n')
                    .map((item) => item.trim())
                    .filter(Boolean),
                )
              }
            />
          )}
        />
      </section>

      <section className="rounded-[26px] border border-white/10 bg-black/35 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <FieldLabel
              label="Готовность проекта"
              hint="Отметь, что уже подготовлено. Процент посчитается автоматически."
              optional
            />
          </div>

          <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-black text-emerald-100">
            Готовность: {readinessScore}%
          </div>
        </div>

        <div className="mb-4 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#5227FF] via-[#8B7CFF] to-emerald-300 transition-all"
            style={{ width: `${readinessScore}%` }}
          />
        </div>

        <Controller
          control={control}
          name="readiness_items"
          render={({ field }) => (
            <CheckboxGroup
              label="Чек-лист готовности"
              hint="Необязательное поле."
              optional
              options={READINESS_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              labelsMap={readinessLabels}
            />
          )}
        />
      </section>

      <section className="rounded-[26px] border border-white/10 bg-black/35 p-5">
        <Controller
          control={control}
          name="cooperation_needs"
          render={({ field }) => (
            <CheckboxGroup
              label="Что ищем по сотрудничеству"
              hint="Необязательное поле. Можно выбрать несколько вариантов."
              optional
              options={COOPERATION_NEED_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              labelsMap={cooperationNeedLabels}
            />
          )}
        />

        <Textarea
          label="Что предлагаем партнёру / инвестору"
          hint="Необязательное поле. Кратко опиши ценность сотрудничества."
          optional
          error={errors.cooperation_offer?.message}
          {...register('cooperation_offer')}
        />
      </section>

      <Controller
        control={control}
        name="community_statuses"
        render={({ field }) => (
          <CheckboxGroup
            label="Дополнительные запросы проекта"
            hint="Необязательное поле."
            optional
            options={COMMUNITY_STATUSES}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <section className="rounded-[26px] border border-amber-300/15 bg-amber-400/5 p-5">
        <FieldLabel
          label="Внутренний CRM"
          hint="Эти поля для внутренней работы компании. Они не обязаны показываться публично."
          optional
        />

        <div className="mt-5 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Ответственный"
              hint="Кто внутри компании ведёт проект."
              optional
              {...register('crm.owner')}
            />

            <Input
              label="Последний контакт"
              hint="Дата последней связи с командой проекта."
              optional
              type="date"
              {...register('crm.last_contact_at')}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="crm.priority"
              render={({ field }) => (
                <Select
                  label="Внутренний приоритет"
                  hint="Помогает сортировать проекты внутри CRM."
                  optional
                  value={field.value}
                  onChange={field.onChange}
                >
                  {CRM_PRIORITY_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {crmPriorityLabels[item]}
                    </option>
                  ))}
                </Select>
              )}
            />

            <Controller
              control={control}
              name="crm.status"
              render={({ field }) => (
                <Select
                  label="CRM статус"
                  hint="Готов к показу — проект появится публично."
                  optional
                  value={field.value}
                  onChange={field.onChange}
                >
                  {CRM_STATUS_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {crmStatusLabels[item]}
                    </option>
                  ))}
                </Select>
              )}
            />
          </div>

          <Input
            label="Следующее действие"
            hint="Например: обновить презентацию, связаться с инвестором, подготовить пилот."
            optional
            {...register('crm.next_action')}
          />

          <Textarea
            label="Внутренняя заметка"
            hint="Комментарий только для внутренней работы."
            optional
            {...register('crm.notes')}
          />
        </div>

      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="Страна"
          hint="Начните вводить страну или выберите из списка."
          optional
          list="country-suggestions"
          error={errors.country?.message}
          {...register('country')}
        />

        <Input
          label="Город"
          hint="Начните вводить город или населённый пункт."
          optional
          list="city-suggestions"
          error={errors.city?.message}
          {...register('city')}
        />
      </div>

      <datalist id="country-suggestions">
        {COUNTRY_SUGGESTIONS.map((country) => (
          <option key={country} value={country} />
        ))}
      </datalist>

      <datalist id="city-suggestions">
        {CITY_SUGGESTIONS.map((city) => (
          <option key={city} value={city} />
        ))}
      </datalist>

      <div className="flex flex-wrap gap-3 pt-4">
        <button
          type="submit"
          disabled={
            isSubmitting ||
            uploadingLogo ||
            uploadingGallery ||
            uploadingPresentation
          }
          className="inline-flex items-center justify-center rounded-2xl bg-[#5227FF] px-6 py-3 text-base font-bold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSubmitting
            ? 'Сохранение...'
            : mode === 'edit'
              ? 'Сохранить изменения'
              : 'Создать проект'}
        </button>

        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center justify-center rounded-2xl bg-red-500 px-6 py-3 text-base font-bold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-400"
          >
            Удалить проект
          </button>
        )}

        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-6 py-3 text-base font-bold text-white transition hover:bg-white/20"
        >
          Назад
        </button>
      </div>
    </form>
  );
}

function FieldLabel({
  label,
  hint,
  required,
  optional,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
}) {
  const displayHint =
    hint?.trim().replace(/^(Обязательное|Необязательное)\s+поле\.?\s*/i, '') ||
    '';

  return (
    <div className="mb-2 min-h-[46px]">
      <div className="flex flex-wrap items-center gap-2">
        <label className="block text-sm font-bold text-white">{label}</label>

        {required && (
          <span className="rounded-full border border-red-300/20 bg-red-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-red-100">
            обязательно
          </span>
        )}

        {optional && (
          <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/55">
            необязательно
          </span>
        )}
      </div>

      {displayHint && (
        <p className="mt-1 text-xs leading-relaxed text-white/45">{displayHint}</p>
      )}
    </div>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
};

function Input({
  label,
  error,
  hint,
  required,
  optional,
  ...props
}: FieldProps) {
  return (
    <div>
      <FieldLabel
        label={label}
        hint={hint}
        required={required}
        optional={optional}
      />

      <input
        className={`h-[58px] w-full rounded-2xl border px-5 text-slate-950 outline-none transition placeholder:text-slate-400 ${
          error
            ? 'border-red-400 bg-red-50 focus:border-red-500'
            : 'border-white/10 bg-white/95 focus:border-[#5227FF]'
        }`}
        {...props}
      />

      {error && (
        <p className="mt-2 text-sm font-medium text-red-200">{error}</p>
      )}
    </div>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
};

function Textarea({
  label,
  error,
  hint,
  required,
  optional,
  ...props
}: TextareaProps) {
  return (
    <div>
      <FieldLabel
        label={label}
        hint={hint}
        required={required}
        optional={optional}
      />

      <textarea
        rows={5}
        className={`w-full rounded-2xl border px-5 py-4 text-slate-950 outline-none transition placeholder:text-slate-400 ${
          error
            ? 'border-red-400 bg-red-50 focus:border-red-500'
            : 'border-white/10 bg-white/95 focus:border-[#5227FF]'
        }`}
        {...props}
      />

      {error && (
        <p className="mt-2 text-sm font-medium text-red-200">{error}</p>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
  error,
  hint,
  required,
  optional,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <div>
      <FieldLabel
        label={label}
        hint={hint}
        required={required}
        optional={optional}
      />

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-[58px] w-full rounded-2xl border px-5 text-slate-950 outline-none transition ${
          error
            ? 'border-red-400 bg-red-50 focus:border-red-500'
            : 'border-white/10 bg-white/95 focus:border-[#5227FF]'
        }`}
      >
        {children}
      </select>

      {error && (
        <p className="mt-2 text-sm font-medium text-red-200">{error}</p>
      )}
    </div>
  );
}

function CheckboxGroup({
  label,
  options,
  value = [],
  onChange,
  error,
  max,
  hint,
  required,
  optional,
  labelsMap,
  searchable,
  allowCustom,
  onAddOption,
  showCustomInput,
  onToggleCustomInput,
  onAfterAddOption,
}: {
  label: string;
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  max?: number;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  labelsMap?: Record<string, string>;
  searchable?: boolean;
  allowCustom?: boolean;
  onAddOption?: (option: string) => void;
  showCustomInput?: boolean;
  onToggleCustomInput?: () => void;
  onAfterAddOption?: () => void;
}) {
  const [search, setSearch] = useState('');
  const [customValue, setCustomValue] = useState('');
  const normalizedSearch = search.trim().toLowerCase();
  const filteredOptions = normalizedSearch
    ? options.filter((option) =>
        (labelsMap?.[option] ?? option).toLowerCase().includes(normalizedSearch),
      )
    : options;

  function toggle(option: string) {
    const exists = value.includes(option);

    if (exists) {
      onChange(value.filter((item) => item !== option));
      return;
    }

    if (max && value.length >= max) {
      return;
    }

    onChange([...value, option]);
  }

  function addCustomOption() {
    const option = customValue.trim();

    if (!option || value.includes(option)) {
      setCustomValue('');
      return;
    }

    if (max && value.length >= max) {
      return;
    }

    onAddOption?.(option);
    onChange([...value, option]);
    setCustomValue('');
    setSearch('');
    onAfterAddOption?.();
  }

  return (
    <div
      className={`rounded-[26px] border p-5 ${
        error
          ? 'border-red-400/30 bg-red-500/5'
          : 'border-white/10 bg-black/35'
      }`}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <FieldLabel
          label={label}
          hint={hint}
          required={required}
          optional={optional}
        />

        {allowCustom && (
          <button
            type="button"
            onClick={onToggleCustomInput}
            className="rounded-2xl border border-cyan-200/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-50 transition hover:bg-cyan-300/20"
          >
            {showCustomInput ? 'Скрыть' : 'Добавить'}
          </button>
        )}
      </div>

      {searchable && (
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск категории..."
          className="mb-3 w-full rounded-2xl border border-white/10 bg-white/95 px-4 py-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#5227FF]"
        />
      )}

      {allowCustom && showCustomInput && (
        <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            value={customValue}
            onChange={(event) => setCustomValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addCustomOption();
              }
            }}
            placeholder="Добавить новую категорию..."
            className="rounded-2xl border border-white/10 bg-white/95 px-4 py-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#5227FF]"
          />

          <button
            type="button"
            onClick={addCustomOption}
            disabled={!customValue.trim() || Boolean(max && value.length >= max)}
            className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Добавить
          </button>
        </div>
      )}

      <div
        className={
          searchable
            ? 'custom-scrollbar grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2'
            : 'flex flex-wrap gap-2'
        }
      >
        {filteredOptions.map((option) => {
          const active = value.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={
                active
                  ? 'rounded-2xl border border-[#5227FF] bg-[#5227FF] px-4 py-2.5 text-left text-sm font-bold text-white shadow-lg shadow-indigo-950/20'
                  : 'rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-left text-sm font-bold text-white/80 transition hover:bg-white/20 hover:text-white'
              }
            >
              {labelsMap?.[option] ?? option}
            </button>
          );
        })}
      </div>

      {filteredOptions.length === 0 && (
        <p className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/50">
          Категории не найдены.
        </p>
      )}

      {max ? (
        <p className="mt-2 text-xs text-white/40">
          Выбрано: {value.length}/{max}
        </p>
      ) : null}

      {error && (
        <p className="mt-2 text-sm font-medium text-red-200">{error}</p>
      )}
    </div>
  );
}
