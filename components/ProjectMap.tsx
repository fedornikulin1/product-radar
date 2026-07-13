'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@/types/project';
import { investmentStageLabels, statusLabels } from '@/lib/projectOptions';

type CityPoint = {
  label: string;
  x: number;
  y: number;
};

type ViewMode = 'map' | 'list';
type StatusFilter = '' | Project['status'];

const CITY_POINTS: Record<string, CityPoint> = {
  саскылах: { label: 'Саскылах', x: 24, y: 31 },
  тикси: { label: 'Тикси', x: 61, y: 25 },
  депутатский: { label: 'Депутатский', x: 74, y: 36 },
  жиганск: { label: 'Жиганск', x: 48, y: 47 },
  верхоянск: { label: 'Верхоянск', x: 64, y: 48 },
  батагай: { label: 'Батагай', x: 70, y: 50 },
  мирный: { label: 'Мирный', x: 24, y: 62 },
  нюрба: { label: 'Нюрба', x: 32, y: 63 },
  вилюйск: { label: 'Вилюйск', x: 41, y: 60 },
  'усть-нера': { label: 'Усть-Нера', x: 77, y: 62 },
  оймякон: { label: 'Оймякон', x: 82, y: 69 },
  сунтар: { label: 'Сунтар', x: 27, y: 70 },
  якутск: { label: 'Якутск', x: 56, y: 71 },
  жатай: { label: 'Жатай', x: 55, y: 68 },
  чурапча: { label: 'Чурапча', x: 63, y: 72 },
  покровск: { label: 'Покровск', x: 52, y: 76 },
  ленск: { label: 'Ленск', x: 24, y: 79 },
  олёкминск: { label: 'Олёкминск', x: 39, y: 79 },
  олекминск: { label: 'Олёкминск', x: 39, y: 79 },
  алдан: { label: 'Алдан', x: 57, y: 84 },
  нерюнгри: { label: 'Нерюнгри', x: 51, y: 91 },
};

const STATUS_STYLES = {
  developing: {
    dot: '#5227FF',
    glow: 'rgba(82, 39, 255, 0.45)',
    label: 'В разработке',
  },
  completed: {
    dot: '#7cff67',
    glow: 'rgba(124, 255, 103, 0.4)',
    label: 'Завершён',
  },
  paused: {
    dot: '#FF9FFC',
    glow: 'rgba(255, 159, 252, 0.42)',
    label: 'На паузе',
  },
} as const;

export default function ProjectMap({ projects }: { projects: Project[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      if (statusFilter && project.status !== statusFilter) return false;

      if (!query) return true;

      return [
        project.title,
        project.short_description,
        project.city,
        project.technologies,
        ...(project.categories || []),
      ].some((value) => value?.toLowerCase().includes(query));
    });
  }, [projects, search, statusFilter]);

  const groupedCities = useMemo(
    () => groupProjectsByCity(filteredProjects),
    [filteredProjects],
  );

  const selectedGroup =
    groupedCities.find((group) => group.cityKey === selectedCity) || null;

  const visibleGroups = selectedCity
    ? selectedGroup
      ? [selectedGroup]
      : []
    : groupedCities;

  const totalMappedProjects = groupedCities.reduce(
    (sum, group) => sum + group.projects.length,
    0,
  );

  const averageReadiness = filteredProjects.length
    ? Math.round(
        filteredProjects.reduce(
          (sum, project) => sum + (project.readiness_score || 0),
          0,
        ) / filteredProjects.length,
      )
    : 0;

  const hasActiveFilters = Boolean(search || statusFilter || selectedCity);

  function resetFilters() {
    setSearch('');
    setStatusFilter('');
    setSelectedCity('');
  }

  return (
    <section className="fade-up rounded-[34px] border border-white/10 bg-black/40 p-4 text-white shadow-2xl shadow-black/25 backdrop-blur-2xl md:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/55">
            Project Map
          </div>

          <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Карта проектов
          </h2>

          <p className="mt-2 max-w-2xl text-white/60">
            География проектов по городам и ключевым точкам присутствия команд.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={
              viewMode === 'map'
                ? 'rounded-2xl bg-[#5227FF] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#5227FF]/20 transition hover:bg-indigo-500'
                : 'rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/20 hover:text-white'
            }
          >
            Карта
          </button>

          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={
              viewMode === 'list'
                ? 'rounded-2xl bg-[#5227FF] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#5227FF]/20 transition hover:bg-indigo-500'
                : 'rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/20 hover:text-white'
            }
          >
            Города
          </button>

          <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white/75">
            {totalMappedProjects} на карте
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-[26px] border border-white/10 bg-black/30 p-3 md:p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-white/35">
              ⌕
            </span>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setSelectedCity('');
              }}
              placeholder="Найти проект, город или технологию..."
              className="h-12 w-full rounded-2xl border border-white/10 bg-black/35 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#5227FF]/70 focus:bg-black/40"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusButton
              active={statusFilter === ''}
              onClick={() => {
                setStatusFilter('');
                setSelectedCity('');
              }}
            >
              Все статусы
            </StatusButton>
            <StatusButton
              active={statusFilter === 'developing'}
              color={STATUS_STYLES.developing.dot}
              onClick={() => {
                setStatusFilter('developing');
                setSelectedCity('');
              }}
            >
              В разработке
            </StatusButton>
            <StatusButton
              active={statusFilter === 'completed'}
              color={STATUS_STYLES.completed.dot}
              onClick={() => {
                setStatusFilter('completed');
                setSelectedCity('');
              }}
            >
              Завершён
            </StatusButton>
            <StatusButton
              active={statusFilter === 'paused'}
              color={STATUS_STYLES.paused.dot}
              onClick={() => {
                setStatusFilter('paused');
                setSelectedCity('');
              }}
            >
              На паузе
            </StatusButton>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          <MapMetric label="Найдено" value={filteredProjects.length} />
          <MapMetric label="Городов" value={groupedCities.length} />
          <MapMetric label="Средняя готовность" value={`${averageReadiness}%`} />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-white/60 transition hover:bg-white/20 hover:text-white"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedCity('')}
          className={
            selectedCity === ''
              ? 'rounded-full border border-white/20 bg-white px-4 py-2 text-sm font-black text-slate-950'
              : 'rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-white/20 hover:text-white'
          }
        >
          Все города
        </button>

        {groupedCities.map((group) => (
          <button
            key={group.cityKey}
            type="button"
            onClick={() =>
              setSelectedCity(selectedCity === group.cityKey ? '' : group.cityKey)
            }
            className={
              selectedCity === group.cityKey
                ? 'rounded-full border border-[#7cff67]/60 bg-[#7cff67] px-4 py-2 text-sm font-black text-slate-950 shadow-lg shadow-[#7cff67]/20'
                : 'rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-white/20 hover:text-white'
            }
          >
            {group.point.label}
            <span className="ml-2 opacity-60">{group.projects.length}</span>
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <LegendItem color={STATUS_STYLES.developing.dot} label="В разработке" />
        <LegendItem color={STATUS_STYLES.completed.dot} label="Завершён" />
        <LegendItem color={STATUS_STYLES.paused.dot} label="На паузе" />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="rounded-[28px] border border-white/10 bg-black/35 p-8 text-center text-white/60">
          <div className="text-lg font-bold text-white">Проекты не найдены</div>
          <p className="mt-2 text-sm text-white/50">
            Измени поисковый запрос или сбрось выбранные фильтры.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 rounded-2xl bg-[#5227FF] px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500"
          >
            Показать все проекты
          </button>
        </div>
      ) : viewMode === 'map' ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <MapCanvas
            groups={groupedCities}
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
          />

          <CityPanel
            groups={visibleGroups}
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
          />
        </div>
      ) : (
        <CityList groups={visibleGroups} />
      )}
    </section>
  );
}

function MapCanvas({
  groups,
  selectedCity,
  onSelectCity,
}: {
  groups: ReturnType<typeof groupProjectsByCity>;
  selectedCity: string;
  onSelectCity: (value: string) => void;
}) {
  return (
    <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-[#050816]/80 p-4 md:min-h-[620px] md:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_62%,rgba(82,39,255,0.2),transparent_38%),radial-gradient(circle_at_72%_35%,rgba(124,255,103,0.1),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:34px_34px] opacity-25" />

      <div className="relative aspect-square w-full max-w-[610px]">
        <Image
          src="/maps/sakha-republic.svg"
          alt="Схематичная карта Республики Саха (Якутия)"
          fill
          unoptimized
          className="pointer-events-none object-contain opacity-25 saturate-0 brightness-150"
        />

        {groups.map((group) => {
          const isSelected = selectedCity === group.cityKey;

          return (
            <button
              key={group.cityKey}
              type="button"
              onClick={() => onSelectCity(isSelected ? '' : group.cityKey)}
              aria-pressed={isSelected}
              className={`group/city absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center transition-all duration-300 ease-out ${
                isSelected
                  ? 'pointer-events-none scale-75 opacity-0'
                  : 'cursor-pointer scale-100 opacity-100 hover:scale-110'
              }`}
              style={{
                left: `${group.point.x}%`,
                top: `${group.point.y}%`,
              }}
            >
              <span
                className={
                  isSelected
                    ? 'flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#7cff67] text-xs font-black text-slate-950 shadow-[0_0_34px_rgba(124,255,103,0.75)]'
                    : 'flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/80 bg-[#7cff67] text-[11px] font-black text-slate-950 shadow-[0_0_24px_rgba(124,255,103,0.55)] transition group-hover/city:border-white'
                }
              >
                {group.projects.length}
              </span>

              <span
                className={
                  isSelected
                    ? 'mt-1.5 block whitespace-nowrap rounded-full bg-[#7cff67] px-3 py-1 text-[11px] font-black text-slate-950 shadow-lg shadow-[#7cff67]/20'
                    : 'mt-1.5 block whitespace-nowrap rounded-full border border-white/10 bg-black/75 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur'
                }
              >
                {group.point.label}
              </span>
            </button>
          );
        })}

        {groups
          .filter((group) => group.cityKey === selectedCity)
          .map((group) => (
            <CityCluster key={group.cityKey} group={group} />
          ))}
      </div>

      <div className="absolute bottom-3 left-4 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] text-white/35 backdrop-blur">
        Границы улусов: Wikimedia Commons, CC BY-SA 2.5
      </div>
    </div>
  );
}

function getProjectOffset(index: number, total: number) {
  if (total === 1) {
    return { x: 34, y: -24 };
  }

  const pointsPerRing = 8;
  const ringIndex = index % pointsPerRing;
  const ring = Math.floor(index / pointsPerRing);
  const pointsInRing = Math.min(total - ring * pointsPerRing, pointsPerRing);
  const radius = 48 + ring * 28;
  const angle = -Math.PI / 2 + (ringIndex * Math.PI * 2) / pointsInRing;

  return {
    x: Math.round(Math.cos(angle) * radius),
    y: Math.round(Math.sin(angle) * radius),
  };
}

function CityCluster({
  group,
}: {
  group: ReturnType<typeof groupProjectsByCity>[number];
}) {
  return (
    <div
      className="absolute z-40"
      style={{
        left: `${group.point.x}%`,
        top: `${group.point.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {group.projects.map((project, index) => {
        const offset = getProjectOffset(index, group.projects.length);

        const style = STATUS_STYLES[project.status];

        return (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="map-project-pop group absolute z-10 hover:z-50 focus-visible:z-50"
            style={{
              left: `${offset.x}px`,
              top: `${offset.y}px`,
              '--map-origin-x': `${-offset.x}px`,
              '--map-origin-y': `${-offset.y}px`,
              animationDelay: `${index * 55}ms`,
            } as CSSProperties}
            title={`${project.title} — ${group.point.label}`}
          >
            <span
              className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md transition"
              style={{ backgroundColor: style.glow }}
            />

            <span
              className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-lg transition group-hover:scale-125"
              style={{
                backgroundColor: style.dot,
                boxShadow: `0 0 24px ${style.glow}`,
              }}
            >
              <span className="h-2 w-2 rounded-full bg-white" />
            </span>

            <span
              className={`pointer-events-none absolute top-1/2 max-w-36 -translate-y-1/2 truncate rounded-full border border-white/10 bg-black/75 px-2.5 py-1 text-[10px] font-bold text-white/85 shadow-lg shadow-black/20 backdrop-blur-md ${
                offset.x < 0 ? 'right-7 text-right' : 'left-7 text-left'
              }`}
            >
              {project.title}
            </span>

            <span className="pointer-events-none absolute left-1/2 top-7 z-50 hidden w-64 -translate-x-1/2 rounded-2xl border border-white/10 bg-black/90 p-3 text-left shadow-2xl backdrop-blur-xl group-hover:block">
              <span className="block text-sm font-black text-white">
                {project.title}
              </span>

              <span className="mt-1 block text-xs text-white/55">
                {group.point.label}
              </span>

              <span
                className="mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-black text-slate-950"
                style={{ backgroundColor: style.dot }}
              >
                {statusLabels[project.status]}
              </span>

              <span className="mt-2 line-clamp-2 block text-xs leading-relaxed text-white/50">
                {project.short_description}
              </span>
            </span>
          </Link>
        );
      })}

    </div>
  );
}

function CityPanel({
  groups,
  selectedCity,
  onSelectCity,
}: {
  groups: ReturnType<typeof groupProjectsByCity>;
  selectedCity: string;
  onSelectCity: (value: string) => void;
}) {
  if (!selectedCity) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-[28px] border border-white/10 bg-black/35 p-6 text-center lg:min-h-[620px]">
        <div className="max-w-64">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#7cff67]/25 bg-[#7cff67]/10 text-2xl text-[#7cff67]">
            ⌖
          </div>
          <h3 className="mt-4 text-xl font-black text-white">
            Выбери город
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            Нажми на крупную зелёную точку — проекты города плавно раскроются на карте и появятся здесь списком.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-[620px] overflow-y-auto rounded-[28px] border border-white/10 bg-black/35 p-3 custom-scrollbar">
      <div className="space-y-3">
        {groups.map((group) => (
          <div
            key={group.cityKey}
            className="rounded-2xl border border-white/10 bg-black/25 p-4"
          >
            <button
              type="button"
              onClick={() =>
                onSelectCity(selectedCity === group.cityKey ? '' : group.cityKey)
              }
              className="mb-3 flex w-full items-center justify-between gap-3 text-left"
            >
              <div>
                <h3 className="font-black text-white">
                  {group.point.label}
                </h3>

                <p className="text-sm text-white/50">
                  {group.projects.length} {pluralizeProjects(group.projects.length)}
                </p>
              </div>

              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/65">
                {group.projects.length}
              </span>
            </button>

            <div className="space-y-2">
              {group.projects.map((project) => (
                <ProjectMapRow key={project.id} project={project} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CityList({
  groups,
}: {
  groups: ReturnType<typeof groupProjectsByCity>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => (
        <section
          key={group.cityKey}
          className="rounded-[28px] border border-white/10 bg-black/35 p-4"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-white">
                {group.point.label}
              </h3>

              <p className="text-sm text-white/50">
                {group.projects.length} {pluralizeProjects(group.projects.length)}
              </p>
            </div>

            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/65">
              {group.projects.length}
            </span>
          </div>

          <div className="space-y-2">
            {group.projects.map((project) => (
              <ProjectMapRow key={project.id} project={project} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ProjectMapRow({ project }: { project: Project }) {
  const style = STATUS_STYLES[project.status];

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-xl border border-white/10 bg-black/30 p-3 transition hover:bg-white/10"
    >
      <div className="flex items-start gap-3">
        {project.logo_url ? (
          <Image
            src={project.logo_url}
            alt={project.title}
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-sm font-black text-white">
            {project.title[0]}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="truncate font-bold text-white">
            {project.title}
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: style.dot }}
            />
            <span>{statusLabels[project.status]}</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {project.categories.slice(0, 2).map((category) => (
              <span
                key={category}
                className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-white/60"
              >
                {category}
              </span>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 text-[10px] font-bold text-white/45">
            <span>{investmentStageLabels[project.investment_stage]}</span>
            <span>{project.readiness_score || 0}% готовности</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StatusButton({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'inline-flex items-center gap-2 rounded-full border border-white/20 bg-white px-3.5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-black/10'
          : 'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-bold text-white/60 transition hover:bg-white/20 hover:text-white'
      }
    >
      {color && (
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </button>
  );
}

function MapMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs">
      <span className="text-white/40">{label}</span>
      <span className="font-black text-white">{value}</span>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white/65">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </div>
  );
}

function normalizeCity(city?: string) {
  return (city || '')
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е');
}

function groupProjectsByCity(projects: Project[]) {
  const map = new Map<
    string,
    {
      cityKey: string;
      point: CityPoint;
      projects: Project[];
    }
  >();

  for (const project of projects) {
    const cityKey = normalizeCity(project.city);

    if (!cityKey || !CITY_POINTS[cityKey]) {
      continue;
    }

    const point = CITY_POINTS[cityKey];

    if (!map.has(cityKey)) {
      map.set(cityKey, {
        cityKey,
        point,
        projects: [],
      });
    }

    map.get(cityKey)?.projects.push(project);
  }

  return Array.from(map.values()).sort((a, b) => a.point.x - b.point.x);
}

function pluralizeProjects(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) return 'проект';
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return 'проекта';
  }

  return 'проектов';
}
