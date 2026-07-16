'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Project } from '@/types/project';
import {
  audienceTypeLabels,
  cooperationNeedLabels,
  getPlacementTypes,
  investmentStageLabels,
  placementTypeLabels,
  priceLabels,
  readinessLabels,
  statusLabels,
} from '@/lib/projectOptions';

function getAudienceTypes(project: Project) {
  if (project.audience_types?.length) return project.audience_types;
  if (project.audience_type === 'b2b_b2c') return ['b2b', 'b2c'] as const;
  if (project.audience_type) return [project.audience_type];
  return ['b2b'] as const;
}

export default function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  if (!project) return null;

  const audienceTypes = getAudienceTypes(project);
  const placementLabel = getPlacementTypes(project)
    .map((type) => placementTypeLabels[type])
    .join(' + ');

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <article
        className="custom-scrollbar max-h-[calc(100vh-2rem)] w-full max-w-6xl overflow-y-auto rounded-[34px] border border-white/10 bg-[#0b2d42]/94 p-5 text-white shadow-2xl shadow-black/40 backdrop-blur-2xl md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 gap-5">
            {project.logo_url ? (
              <Image
                src={project.logo_url}
                alt={project.title}
                width={124}
                height={124}
                unoptimized
                className="h-24 w-24 shrink-0 rounded-[26px] object-cover shadow-lg shadow-black/20 md:h-[124px] md:w-[124px]"
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[26px] border border-white/10 bg-white/10 text-5xl font-black md:h-[124px] md:w-[124px]">
                {project.title?.[0] || '?'}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                {audienceTypes.map((type) => (
                  <Tag key={type} tone="green">{audienceTypeLabels[type]}</Tag>
                ))}
                <Tag tone="violet">{investmentStageLabels[project.investment_stage]}</Tag>
                {placementLabel && <Tag>{placementLabel}</Tag>}
              </div>

              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
                {project.title}
              </h2>

              <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/70 md:text-lg">
                {project.short_description}
              </p>

            </div>
          </div>

          {(project.presentation_url || project.link) && (
            <div className="mt-1 flex flex-wrap gap-3 lg:mr-2 lg:mt-9">
              {project.presentation_url && (
                <PrimaryProjectLink href={project.presentation_url}>
                  Презентация проекта
                </PrimaryProjectLink>
              )}
              {project.link && (
                <PrimaryProjectLink href={project.link}>
                  Сайт проекта
                </PrimaryProjectLink>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть карточку проекта"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xl text-white/80 transition hover:bg-white/20 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            <InfoBlock title="Описание">
              {project.full_description || project.short_description}
            </InfoBlock>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoBlock title="Для кого / рынок">{project.for_whom || 'Аудитория уточняется'}</InfoBlock>
              <InfoBlock title="Проблема">{project.problem || 'Проблема уточняется'}</InfoBlock>
              <InfoBlock title="Решение">{project.solution || 'Решение уточняется'}</InfoBlock>
              <InfoBlock title="Преимущества">{project.advantages || 'Преимущества уточняются'}</InfoBlock>
            </div>

            {(project.cooperation_needs?.length || project.cta) && (
              <div className="rounded-[24px] border border-amber-200/15 bg-amber-300/10 p-5">
                <div className="text-sm font-black uppercase tracking-[0.16em] text-amber-100/70">
                  Запрос проекта
                </div>
                {project.cta && (
                  <p className="mt-3 text-base leading-relaxed text-white/80">
                    {project.cta}
                  </p>
                )}
                {project.cooperation_needs?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.cooperation_needs.map((need) => (
                      <Tag key={need} tone="amber">{cooperationNeedLabels[need]}</Tag>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {(project.additional || project.cooperation_offer || project.video_url) && (
              <div className="grid gap-4 md:grid-cols-2">
                {project.cooperation_offer && (
                  <InfoBlock title="Что предлагает проект">
                    {project.cooperation_offer}
                  </InfoBlock>
                )}
                {project.additional && (
                  <InfoBlock title="Дополнительно">
                    {project.additional}
                  </InfoBlock>
                )}
                {project.video_url && (
                  <InfoBlock title="Видео">
                    <ContactLine href={project.video_url} value="Открыть видео" external />
                  </InfoBlock>
                )}
              </div>
            )}

            {(project.team_members?.length || project.team_open_roles?.length) && (
              <section className="rounded-[24px] border border-white/10 bg-black/25 p-5">
                <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white/40">
                  Команда
                </h3>

                {project.team_members?.length ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {project.team_members.map((member) => (
                      <div
                        key={member.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"
                      >
                        <div className="text-base font-black text-white">
                          {member.name || 'Участник команды'}
                        </div>
                        {member.role && (
                          <div className="mt-1 text-sm font-bold text-cyan-100/85">
                            {member.role}
                          </div>
                        )}
                        {member.bio && (
                          <p className="mt-2 text-sm leading-relaxed text-white/62">
                            {member.bio}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {member.telegram && (
                            <ContactLine href={formatTelegram(member.telegram)} value="Telegram" />
                          )}
                          {member.linkedin && (
                            <ContactLine href={member.linkedin} value="LinkedIn" external />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {project.team_open_roles?.length ? (
                  <div className="mt-5">
                    <div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                      Открытые роли
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.team_open_roles.map((role) => (
                        <Tag key={role}>{role}</Tag>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            )}

            {project.gallery_urls.length > 0 && (
              <ProjectGallery images={project.gallery_urls} />
            )}
          </div>

          <aside className="space-y-4">
            <SideMetric title="Инвестиции" value={project.investment_amount || 'Сумма уточняется'} large />
            <SideMetric title="Статус проекта" value={statusLabels[project.status]} />
            <SideMetric title="Модель оплаты" value={priceLabels[project.price]} />
            <SideMetric title="Категории" value={(project.categories || []).join(', ') || 'Не указаны'} />
            <SideMetric title="Локация" value={[project.country, project.city].filter(Boolean).join(', ') || 'Не указана'} />
            <SideMetric title="Технологии" value={project.technologies || 'Уточняются'} />
            <SideMetric title="Команда" value={formatTeamCount(project.team_members?.length || 0)} />

            {project.readiness_items?.length ? (
              <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-white/40">
                  Чеклист готовности
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.readiness_items.map((item) => (
                    <Tag key={item} tone="green">{readinessLabels[item]}</Tag>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-white/40">
                Контакты
              </div>
              <div className="mt-3 space-y-2 text-sm text-white/75">
                {project.contact_email && <ContactLine href={`mailto:${project.contact_email}`} value={project.contact_email} />}
                {project.contact_phone && <ContactLine href={`tel:${project.contact_phone}`} value={project.contact_phone} />}
                {project.telegram && <ContactLine href={formatTelegram(project.telegram)} value={project.telegram} />}
              </div>
            </div>

          </aside>
        </div>
      </article>
    </div>
  );
}

function Tag({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'green' | 'violet' | 'amber';
}) {
  const toneClass = {
    neutral: 'border-white/10 bg-black/20 text-white/80',
    green: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
    violet: 'border-[#5227FF]/40 bg-[#5227FF]/25 text-violet-100',
    amber: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
  }[tone];

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-black ${toneClass}`}>
      {children}
    </span>
  );
}

function PrimaryProjectLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-300/15 px-6 text-base font-black text-cyan-50 shadow-lg shadow-black/15 transition hover:-translate-y-0.5 hover:bg-cyan-300/25"
    >
      {children}
    </a>
  );
}

function InfoBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-black/25 p-5">
      <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white/40">
        {title}
      </h3>
      <div className="mt-3 text-base leading-relaxed text-white/78">{children}</div>
    </section>
  );
}

function ProjectGallery({ images }: { images: string[] }) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    if (!activeImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveImage(null);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
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
      <section className="rounded-[24px] border border-white/10 bg-black/25 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white/40">
              Материалы
            </h3>
            <p className="mt-1 text-sm text-white/55">
              Галерея, скриншоты и визуальные материалы.
            </p>
          </div>

          {images.length > 3 && (
            <div className="flex gap-2">
              <GalleryArrow onClick={goPrev}>‹</GalleryArrow>
              <GalleryArrow onClick={goNext}>›</GalleryArrow>
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
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
                width={900}
                height={560}
                unoptimized
                className="h-32 w-full object-cover transition duration-300 group-hover:scale-105 md:h-36"
              />

              <div className="flex items-center justify-between px-3 py-2 text-xs font-bold text-white/60">
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
          <div className="mt-4 flex justify-center gap-2">
            {images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setStartIndex(index)}
                className={
                  index === startIndex
                    ? 'h-2 w-7 rounded-full bg-white'
                    : 'h-2 w-2 rounded-full bg-white/30 transition hover:bg-white/60'
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

function GalleryArrow({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-2xl font-black text-white transition hover:bg-white/20"
    >
      {children}
    </button>
  );
}

function SideMetric({
  title,
  value,
  large = false,
}: {
  title: string;
  value: string;
  large?: boolean;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-white/40">
        {title}
      </div>
      <div className={large ? 'mt-2 text-2xl font-black text-white' : 'mt-2 text-base font-bold text-white/82'}>
        {value}
      </div>
    </div>
  );
}

function ContactLine({
  href,
  value,
  external = false,
}: {
  href: string;
  value: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="block rounded-xl bg-white/[0.06] px-3 py-2 transition hover:bg-white/[0.1] hover:text-white"
    >
      {value}
    </a>
  );
}

function formatTelegram(value: string) {
  if (value.startsWith('http')) return value;
  const username = value.replace(/^@/, '').trim();
  return `https://t.me/${username}`;
}

function formatTeamCount(count: number) {
  if (!count) return 'Состав уточняется';

  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) return `${count} участник`;
  if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
    return `${count} участника`;
  }

  return `${count} участников`;
}
