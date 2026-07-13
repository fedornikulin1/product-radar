'use client';
import PageReveal from '@/components/PageReveal';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ProjectCard from '@/components/ProjectCard';
import ColorBendsBackground from '@/components/effects/ColorBendsBackground';
import { Project, AudienceType } from '@/types/project';
import {
  audienceTypeLabels,
  cooperationNeedLabels,
  cooperationPriorityLabels,
  getPlacementTypes,
  investmentStageDescriptions,
  investmentStageLabels,
  placementTypeLabels,
  priceLabels,
  readinessLabels,
} from '@/lib/projectOptions';

function getAudienceTypes(project: Project): AudienceType[] {
  if (Array.isArray(project.audience_types) && project.audience_types.length > 0) {
    return project.audience_types as AudienceType[];
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

function getRelatedProjects(currentProject: Project, allProjects: Project[]) {
  return allProjects
    .filter((item) => item.id !== currentProject.id)
    .map((item) => {
      let score = 0;

      const currentCategories = currentProject.categories || [];
      const itemCategories = item.categories || [];

      currentCategories.forEach((category) => {
        if (itemCategories.includes(category)) score += 3;
      });

      if (item.investment_stage === currentProject.investment_stage) {
        score += 2;
      }

      if (
        getPlacementTypes(item).some((type) =>
          getPlacementTypes(currentProject).includes(type),
        )
      ) {
        score += 1;
      }

      const currentAudiences: AudienceType[] = getAudienceTypes(currentProject);
      const itemAudiences: AudienceType[] = getAudienceTypes(item);

      currentAudiences.forEach((audience) => {
        if (itemAudiences.includes(audience)) score += 2;
      });

      if (item.city && currentProject.city && item.city === currentProject.city) {
        score += 1;
      }

      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.item);
}

export default function ProjectPage() {
  const params = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    });
  }, [params.id]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');

      try {
        const [projectRes, allProjectsRes, adminRes] = await Promise.all([
          fetch(`/api/projects/${params.id}`),
          fetch('/api/projects?sort=created_at.desc'),
          fetch('/api/admin/me', { cache: 'no-store' }),
        ]);

        if (!projectRes.ok) {
          throw new Error('Проект не найден');
        }

        const projectData = await projectRes.json();
        const allProjectsData = allProjectsRes.ok ? await allProjectsRes.json() : [];
        const adminData = adminRes.ok ? await adminRes.json() : null;

        setProject(projectData);
        setAllProjects(Array.isArray(allProjectsData) ? allProjectsData : []);
        setIsAdmin(Boolean(adminData?.isAdmin));
      } catch {
        setError('Проект не найден');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadData();
    }
  }, [params.id]);

  const relatedProjects = useMemo(() => {
    if (!project) return [];
    return getRelatedProjects(project, allProjects);
  }, [project, allProjects]);

  if (loading) {
    return (
      <main className="relative min-h-screen px-4 py-6 md:px-8 md:py-10">
        <ColorBendsBackground />
        <section className="relative z-10 mx-auto max-w-7xl">
          <div className="rounded-[28px] border border-white/10 bg-black/40 p-10 text-center text-white/70 shadow-2xl shadow-black/20 backdrop-blur-xl">
            Загрузка проекта...
          </div>
        </section>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="relative min-h-screen px-4 py-6 md:px-8 md:py-10">
        <ColorBendsBackground />
        <section className="relative z-10 mx-auto max-w-7xl">
          <div className="rounded-[28px] border border-red-400/20 bg-red-500/10 p-10 text-center text-red-100 shadow-2xl shadow-black/20 backdrop-blur-xl">
            {error || 'Проект не найден'}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen px-4 py-6 md:px-8 md:py-10">
      <ColorBendsBackground />

      <article className="relative z-10 mx-auto max-w-7xl">
      <PageReveal delay={0}>
        <div className="relative text-white">
          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <MainBlock project={project} />
            <SidebarBlock project={project} isAdmin={isAdmin} />
          </div>
        </div>

        {project.gallery_urls.length > 0 && (
          <PageReveal delay={0.08}>
            <ProjectGallery images={project.gallery_urls} />
          </PageReveal>
        )}

        {project.video_url && (
          <PageReveal delay={0.12}>
            <VideoBlock videoUrl={project.video_url} />
          </PageReveal>
        )}

        {relatedProjects.length > 0 && (
        <PageReveal delay={0.16}>
            <section className="mt-5 rounded-[28px] border border-white/10 bg-black/40 p-5 text-white shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="mb-5">
              <h2 className="text-2xl font-black text-white">
                Может быть интересно
              </h2>

              <p className="mt-1 text-sm text-white/55">
                Похожие проекты по стадии, рынку, категории и формату.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((item) => (
                <ProjectCard key={item.id} project={item} />
              ))}
            </div>
          </section>
          </PageReveal>
        )}
         </PageReveal>
      </article>
      
    </main>
    
  );
}

function MainBlock({ project }: { project: Project }) {
  const investmentStage = project.investment_stage || 'pre_seed';
  const audienceTypes = getAudienceTypes(project);
  const placementTypes = getPlacementTypes(project);

  return (
    <section className="rounded-[28px] border border-white/10 bg-black/40 p-5 text-white shadow-xl shadow-black/10 backdrop-blur-xl md:p-6">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div>
          <ProjectImage project={project} />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 text-sm font-black text-white/80 shadow-lg shadow-black/10 transition hover:bg-white/20 hover:text-white"
              >
                Открыть сайт
              </a>
            )}

            {project.presentation_url && (
              <a
                href={project.presentation_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-14 items-center justify-center rounded-2xl border border-[#5227FF]/40 bg-[#5227FF]/25 px-5 text-sm font-black text-violet-100 shadow-lg shadow-[#5227FF]/10 transition hover:bg-[#5227FF]/35 hover:text-white"
              >
                Презентация
              </a>
            )}
          </div>
        </div>

        <div className="min-w-0 pr-8 md:pr-10">
          <h1 className="text-3xl font-black leading-tight tracking-tight text-white md:text-4xl">
            {project.title}
          </h1>

          <div className="mt-4 flex flex-wrap gap-2">
            {audienceTypes.map((type) => (
              <HighlightBadge key={type}>
                {audienceTypeLabels[type]}
              </HighlightBadge>
            ))}

            <PurpleBadge>{investmentStageLabels[investmentStage]}</PurpleBadge>

            {placementTypes.map((type) => (
              <SmallBadge key={type}>{placementTypeLabels[type]}</SmallBadge>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-2 text-sm text-white/55">
            <span className="mt-0.5 text-[#8B7CFF]">⌖</span>
            <span>
              {project.country || 'Регион уточняется'}
              {project.city ? `, ${project.city}` : ', Город уточняется'}
            </span>
          </div>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75">
            {project.short_description}
          </p>

          {project.full_description && (
            <p className="mt-4 max-w-2xl whitespace-pre-line text-base leading-relaxed text-white/60">
              {project.full_description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {project.categories.map((category) => (
              <SmallBadge key={category}>{category}</SmallBadge>
            ))}
          </div>
        </div>
      </div>

      <Divider />

      <section>
        <h2 className="text-lg font-black text-white">
          Показатели проекта
        </h2>

        <div className="mt-4 grid divide-y divide-white/10 md:grid-cols-4 md:divide-x md:divide-y-0">
          <Metric
            title={investmentStageLabels[investmentStage]}
            subtitle="Стадия инвестирования"
          />

          <Metric
            title={audienceTypes.map((type) => audienceTypeLabels[type]).join(' / ')}
            subtitle="Рынок"
          />

          <Metric
            title={project.categories[0] || 'Не указано'}
            subtitle="Направление"
          />

          <Metric
            title={String(project.gallery_urls.length)}
            subtitle="Материалы"
          />
        </div>

        <p className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-white/55">
          {investmentStageDescriptions[investmentStage]}
        </p>
      </section>

      <Divider />

      <ReadinessSection project={project} />

      <Divider />

      <section className="grid gap-4 md:grid-cols-2">
        <TextCard
          title="Для кого"
          value={`${audienceTypes.map((type) => audienceTypeLabels[type]).join(' / ')}\n${project.for_whom || ''}`}
        />

        <TextCard title="Проблема" value={project.problem} />
        <TextCard title="Решение" value={project.solution} />
        <TextCard title="Преимущества" value={project.advantages} />
      </section>

      <Divider />

      <CooperationSection project={project} />

      <Divider />

      <TeamSection project={project} />

      {project.additional && (
        <>
          <Divider />
          <TextCard title="Дополнительно" value={project.additional} />
        </>
      )}
    </section>
  );
}

function SidebarBlock({
  project,
  isAdmin,
}: {
  project: Project;
  isAdmin: boolean;
}) {
  const placementTypes = getPlacementTypes(project);

  return (
    <aside className="space-y-4">
      <section className="rounded-[28px] border border-white/10 bg-black/40 p-5 text-white shadow-xl shadow-black/10 backdrop-blur-xl">
        <h2 className="text-base font-black text-white">
          Основная информация
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-white/55">
          Ключевые данные проекта для первичной оценки.
        </p>

        <Divider />

        <div className="space-y-3 text-sm">
          <SideInfoLine
            label="Технологии"
            value={project.technologies || 'Технологии уточняются'}
          />

          <SideInfoLine
            label="Цена"
            value={priceLabels[project.price]}
          />

          <SideInfoLine
            label="Тип размещения"
            value={
              placementTypes
                .map((type) => placementTypeLabels[type])
                .join(' + ')
            }
          />

          <SideInfoLine
            label="Команда"
            value={
              project.team_members?.length
                ? formatTeamCount(project.team_members.length)
                : 'Состав не указан'
            }
          />

          <SideInfoLine
            label="Готовность"
            value={`${project.readiness_score || 0}%`}
          />

          <SideInfoLine
            label="Локация"
            value={`${project.country || 'Страна уточняется'}${
              project.city ? `, ${project.city}` : ''
            }`}
          />
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-black/40 p-5 text-white shadow-xl shadow-black/10 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-white">
              Контакты
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-white/55">
              Связь с командой проекта.
            </p>
          </div>
        </div>

        <Divider />

        <div className="space-y-3 text-sm">
          <ContactLine
            label="Telegram"
            value={project.telegram || 'Telegram уточняется'}
            href={project.telegram ? formatTelegram(project.telegram) : undefined}
          />

          <ContactLine
            label="Email"
            value={project.contact_email || 'Email уточняется'}
            href={project.contact_email ? `mailto:${project.contact_email}` : undefined}
          />

          <ContactLine
            label="Телефон"
            value={project.contact_phone || 'Телефон уточняется'}
            href={project.contact_phone ? `tel:${project.contact_phone}` : undefined}
          />
        </div>

        {isAdmin && (
          <>
            <Divider />

            <Link
              href={`/admin/edit/${project.id}`}
              className="flex h-14 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 text-sm font-black text-white/80 shadow-lg shadow-black/10 transition hover:bg-white/20 hover:text-white"
            >
              Изменить проект
            </Link>
          </>
        )}
      </section>
    </aside>
  );
}

function ReadinessSection({ project }: { project: Project }) {
  const items = project.readiness_items || [];
  const score = project.readiness_score || 0;

  return (
    <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-white">
            Готовность проекта
          </h3>
          <p className="mt-1 text-sm text-white/50">
            Чек-лист зрелости проекта для команды и инвесторов.
          </p>
        </div>

        <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-black text-emerald-100">
          {score}%
        </div>
      </div>

      <div className="mb-5 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#5227FF] via-[#8B7CFF] to-emerald-300"
          style={{ width: `${score}%` }}
        />
      </div>

      {items.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/30 p-3"
            >
              <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-300/15 text-xs font-black text-emerald-100">
                ✓
              </span>
              <span className="text-sm text-white/75">
                {readinessLabels[item]}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/45">
          Готовность проекта пока не заполнена.
        </p>
      )}
    </section>
  );
}

function CooperationSection({ project }: { project: Project }) {
  const needs = project.cooperation_needs || [];
  const communityStatuses = project.community_statuses || [];

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <h3 className="text-base font-black text-white">
          Запрос по сотрудничеству
        </h3>

        <div className="mt-4 flex flex-wrap gap-2">
          {needs.length > 0 ? (
            needs.map((need) => (
              <SmallBadge key={need}>{cooperationNeedLabels[need]}</SmallBadge>
            ))
          ) : (
            <span className="text-sm text-white/45">Запросы не указаны.</span>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
            Срочность
          </div>
          <div className="mt-2 text-sm text-white/75">
            {cooperationPriorityLabels[project.cooperation_priority || 'later']}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
            Основной запрос
          </div>
          <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/75">
            {project.cta || 'Запрос не указан.'}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <h3 className="text-base font-black text-white">
          Что получает партнёр
        </h3>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
            Возможность / оффер
          </div>
          <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/75">
            {project.cooperation_offer || 'Партнёрский оффер пока не заполнен.'}
          </div>
        </div>

        {communityStatuses.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-white/35">
              Дополнительные статусы
            </div>

            <div className="flex flex-wrap gap-2">
              {communityStatuses.map((item) => (
                <SmallBadge key={item}>{item}</SmallBadge>
              ))}
            </div>
          </div>
        )}
      </section>
    </section>
  );
}

function TeamSection({ project }: { project: Project }) {
  const teamMembers = project.team_members || [];
  const openRoles = project.team_open_roles || [];

  if (teamMembers.length === 0 && openRoles.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <h3 className="text-base font-black text-white">
        Команда проекта
      </h3>

      {teamMembers.length > 0 && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl border border-white/10 bg-black/30 p-4"
            >
              <div className="text-lg font-black text-white">
                {member.name || 'Участник команды'}
              </div>

              <div className="mt-1 text-sm font-bold text-[#B8AEFF]">
                {member.role || 'Роль уточняется'}
              </div>

              {member.bio && (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/65">
                  {member.bio}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {member.telegram && (
                  <a
                    href={formatTelegram(member.telegram)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80 transition hover:bg-white/20"
                  >
                    Telegram
                  </a>
                )}

                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80 transition hover:bg-white/20"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {openRoles.length > 0 && (
        <div className="mt-5">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-white/35">
            Открытые роли
          </div>

          <div className="flex flex-wrap gap-2">
            {openRoles.map((role) => (
              <SmallBadge key={role}>{role}</SmallBadge>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ProjectImage({ project }: { project: Project }) {
  const image = project.logo_url || project.gallery_urls[0];

  if (image) {
    return (
      <Image
        src={image}
        alt={project.title}
        width={1200}
        height={800}
        unoptimized
        className="h-[278px] w-full rounded-[24px] object-cover shadow-2xl shadow-black/20"
      />
    );
  }

  return (
    <div className="flex h-[278px] w-full items-center justify-center rounded-[24px] border border-white/10 bg-white/10">
      <div className="text-center">
        <div className="text-xs font-black uppercase tracking-wide text-white/45">
          Изображение проекта
        </div>

        <div className="mt-3 text-6xl font-black text-white/25">
          {project.title[0]}
        </div>
      </div>
    </div>
  );
}

function ProjectGallery({ images }: { images: string[] }) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    if (!activeImage) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveImage(null);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeImage]);

  const visibleImages = useMemo(() => {
    const result: string[] = [];

    for (let i = 0; i < Math.min(3, images.length); i += 1) {
      result.push(images[(startIndex + i) % images.length]);
    }

    return result;
  }, [images, startIndex]);

  function goPrev() {
    setStartIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  }

  function goNext() {
    setStartIndex((current) => (current + 1) % images.length);
  }

  return (
    <>
      <section className="mt-5 rounded-[28px] border border-white/10 bg-black/40 p-5 text-white shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-white">
              Материалы проекта
            </h2>

            <p className="mt-1 text-sm text-white/55">
              Галерея, скриншоты и визуальные материалы.
            </p>
          </div>

          {images.length > 3 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={goPrev}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-2xl font-black text-white transition hover:bg-white/20"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={goNext}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-2xl font-black text-white transition hover:bg-white/20"
              >
                ›
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {visibleImages.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActiveImage(url)}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left shadow-lg shadow-black/20"
            >
              <Image
                src={url}
                alt=""
                width={1200}
                height={800}
                unoptimized
                className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
              />

              <div className="flex items-center justify-between px-4 py-3 text-sm font-bold text-white/60">
                <span>
                  Фото {((startIndex + index) % images.length) + 1} / {images.length}
                </span>

                <span className="text-white/55 transition group-hover:text-white">
                  Увеличить
                </span>
              </div>
            </button>
          ))}
        </div>

        {images.length > 1 && (
          <div className="mt-5 flex justify-center gap-2">
            {images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setStartIndex(index)}
                className={
                  index === startIndex
                    ? 'h-2.5 w-8 rounded-full bg-white'
                    : 'h-2.5 w-2.5 rounded-full bg-white/30 transition hover:bg-white/60'
                }
                aria-label={`Показать фото ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {activeImage &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => setActiveImage(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Просмотр изображения"
          >
            <div
              className="relative max-h-[92vh] max-w-[94vw]"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={activeImage}
                alt=""
                width={1600}
                height={1000}
                unoptimized
                className="h-auto max-h-[92vh] w-auto max-w-[94vw] rounded-[28px] object-contain shadow-2xl shadow-black"
              />

              <button
                type="button"
                onClick={() => setActiveImage(null)}
                className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/65 text-xl font-bold text-white shadow-lg backdrop-blur-md transition hover:bg-black/85"
                aria-label="Закрыть изображение"
              >
                ×
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function VideoBlock({ videoUrl }: { videoUrl: string }) {
  return (
    <section className="mt-5 rounded-[28px] border border-white/10 bg-black/40 p-5 text-white shadow-2xl shadow-black/20 backdrop-blur-xl">
      <h2 className="mb-5 text-2xl font-black text-white">
        Видео
      </h2>

      <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-lg shadow-black/30">
        <iframe
          src={toEmbedUrl(videoUrl)}
          className="h-full w-full"
          allowFullScreen
        />
      </div>
    </section>
  );
}

function Metric({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="px-4 py-4">
      <div className="text-base font-black text-white">
        {title}
      </div>

      <div className="mt-2 text-xs font-medium text-white/45">
        {subtitle}
      </div>
    </div>
  );
}

function SideInfoLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-black/30 p-3">
      <h3 className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
        {label}
      </h3>

      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/70">
        {value}
      </p>
    </section>
  );
}

function TextCard({ title, value }: { title: string; value?: string }) {
  if (!value) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <h3 className="text-base font-black text-white">
        {title}
      </h3>

      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/60">
        {value}
      </p>
    </section>
  );
}

function ContactLine({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="block rounded-xl border border-white/10 bg-black/30 p-3 transition hover:bg-white/10"
      >
        <div className="text-xs font-bold uppercase tracking-wide text-white/35">
          {label}
        </div>

        <div className="mt-1 font-medium text-white/70">
          {value}
        </div>
      </a>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="text-xs font-bold uppercase tracking-wide text-white/35">
        {label}
      </div>

      <div className="mt-1 font-medium text-white/70">
        {value}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="my-6 h-px bg-white/10" />;
}

function SmallBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-medium text-white/85">
      {children}
    </span>
  );
}

function HighlightBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-sm font-black text-emerald-100 shadow-lg shadow-emerald-950/10 backdrop-blur">
      {children}
    </span>
  );
}

function PurpleBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#5227FF]/40 bg-[#5227FF]/25 px-3 py-1 text-sm font-black text-violet-100 shadow-lg shadow-[#5227FF]/10">
      {children}
    </span>
  );
}

function formatTelegram(value: string) {
  if (!value) return '#';

  if (value.startsWith('http')) {
    return value;
  }

  return `https://t.me/${value.replace('@', '')}`;
}

function toEmbedUrl(url: string) {
  if (url.includes('youtube.com/watch?v=')) {
    return url.replace('watch?v=', 'embed/');
  }

  if (url.includes('youtu.be/')) {
    return url.replace('youtu.be/', 'www.youtube.com/embed/');
  }

  return url;
}

function formatTeamCount(count: number) {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${count} участников`;
  }

  if (lastDigit === 1) return `${count} участник`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${count} участника`;
  return `${count} участников`;
}

