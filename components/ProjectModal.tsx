'use client';

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
        className="custom-scrollbar max-h-[calc(100vh-2rem)] w-full max-w-6xl overflow-y-auto rounded-[34px] border border-white/10 bg-[#061728]/92 p-5 text-white shadow-2xl shadow-black/40 backdrop-blur-2xl md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-4">
            {project.logo_url ? (
              <Image
                src={project.logo_url}
                alt={project.title}
                width={88}
                height={88}
                unoptimized
                className="h-20 w-20 shrink-0 rounded-2xl object-cover shadow-lg shadow-black/20 md:h-[88px] md:w-[88px]"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-3xl font-black">
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

            {(project.gallery_urls.length > 0 || project.presentation_url) && (
              <section className="rounded-[24px] border border-white/10 bg-black/25 p-5">
                <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white/40">
                  Материалы
                </h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  {project.presentation_url && (
                    <ContactLine href={project.presentation_url} value="Открыть презентацию" external />
                  )}
                  {project.gallery_urls.map((url, index) => (
                    <ContactLine
                      key={`${url}-${index}`}
                      href={url}
                      value={`Материал ${index + 1}`}
                      external
                    />
                  ))}
                </div>
              </section>
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
                {project.link && <ContactLine href={project.link} value="Сайт проекта" external />}
                {project.presentation_url && <ContactLine href={project.presentation_url} value="Презентация" external />}
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-black/25 p-4 text-sm text-white/55">
              <div>Создано: {formatDate(project.created_at)}</div>
              <div className="mt-1">Обновлено: {formatDate(project.updated_at)}</div>
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

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Дата уточняется';

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
