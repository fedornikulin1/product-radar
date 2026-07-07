'use client';
import PageReveal from '@/components/PageReveal';
import { useEffect, useMemo, useState } from 'react';
import ProjectCard from '@/components/ProjectCard';
import ProjectMap from '@/components/ProjectMap';
import ColorBendsBackground from '@/components/effects/ColorBendsBackground';
import { Project } from '@/types/project';
import {
  PROJECT_CATEGORIES,
  STATUS_OPTIONS,
  statusLabels,
} from '@/lib/projectOptions';

const SORT_OPTIONS = [
  {
    value: 'created_at.desc',
    label: 'Новые',
  },
  {
    value: 'created_at.asc',
    label: 'Старые',
  },
  {
    value: 'title.asc',
    label: 'A–Я',
  },
  {
    value: 'title.desc',
    label: 'Я–A',
  },
];

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('created_at.desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasActiveFilters = Boolean(
    search || category || status || sort !== 'created_at.desc',
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const query = useMemo(() => {
    const params = new URLSearchParams();

    if (debouncedSearch) params.set('search', debouncedSearch);
    if (category) params.set('category', category);
    if (status) params.set('status', status);
    if (sort) params.set('sort', sort);

    return params.toString();
  }, [debouncedSearch, category, status, sort]);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(`/api/projects?${query}`);

        if (!res.ok) {
          throw new Error('Не удалось загрузить проекты');
        }

        const data = await res.json();

        setProjects(data);
      } catch {
        setError('Ошибка загрузки проектов');
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [query]);

  function resetFilters() {
    setSearch('');
    setDebouncedSearch('');
    setCategory('');
    setStatus('');
    setSort('created_at.desc');
  }

  function openAbout() {
    window.dispatchEvent(new Event('open-about-modal'));
  }

  function scrollToProjects() {
    const element = document.getElementById('projects-grid');

    if (!element) return;

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  const citiesCount = new Set(
    projects
      .map((item) => item.city)
      .filter(Boolean),
  ).size;

  const stagesCount = new Set(
    projects
      .map((item) => item.investment_stage)
      .filter(Boolean),
  ).size;

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 md:px-8 md:py-10">
      <ColorBendsBackground />

      <section className="relative z-10 mx-auto max-w-7xl">
        <PageReveal delay={0}>
          <header className="mb-8 rounded-[34px] border border-white/10 bg-black/25 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-xl md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm font-medium text-white/90 backdrop-blur">
                Каталог проектов, MVP и стартапов
              </div>

              <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl">
                Навигатор проектов
              </h1>

              <p className="mt-5 max-w-2xl text-xl leading-relaxed text-white/75">
                Смотри проекты, находи команды, менторов, инвестиции и идеи для
                коллабораций.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={scrollToProjects}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#5227FF] px-6 py-3 text-base font-black text-white shadow-lg shadow-[#5227FF]/15 transition hover:-translate-y-0.5 hover:bg-indigo-500"
                >
                  Смотреть проекты
                </button>

                <button
                  type="button"
                  onClick={openAbout}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-6 py-3 text-base font-bold text-white/80 transition hover:-translate-y-0.5 hover:bg-white/20 hover:text-white"
                >
                  О нас
                </button>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                    Product Snapshot
                  </div>

                  <div className="mt-2 text-2xl font-black text-white">
                    Быстрый обзор платформы
                  </div>
                </div>

                <div className="rounded-full border border-[#5227FF]/40 bg-[#5227FF]/20 px-3 py-1 text-xs font-black text-violet-100">
                  Investor-ready
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <StatCard value={projects.length} label="Проектов" />
                <StatCard value={citiesCount} label="Городов" />
                <StatCard value={stagesCount} label="Стадий" />
                <StatCard value="B2B / B2C / B2G" label="Форматы" />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-sm font-black text-white">
                  Что внутри
                </div>

                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  Карточки проектов, карта по городам, стадии развития,
                  презентации, контакты команд.
                </p>
              </div>
            </div>
          </div>
        </header>
        </PageReveal>
        <PageReveal delay={0.08}>
          <section className="sticky top-24 z-20 mb-10 rounded-[30px] border border-white/10 bg-black/35 p-4 text-white shadow-2xl shadow-black/25 backdrop-blur-2xl">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="relative">
              <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl text-slate-400">
                ⌕
              </div>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск проекта..."
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/95 px-14 text-base font-medium text-slate-950 shadow-lg shadow-black/10 outline-none transition placeholder:text-slate-400 focus:border-[#5227FF] focus:ring-4 focus:ring-[#5227FF]/20"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              {SORT_OPTIONS.map((option) => {
                const active = sort === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSort(option.value)}
                    className={
                      active
                        ? 'rounded-2xl bg-[#5227FF] px-4 py-3 text-sm font-black text-white shadow-lg shadow-[#5227FF]/20 transition hover:bg-indigo-500'
                        : 'rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white/75 transition hover:bg-white/20 hover:text-white'
                    }
                  >
                    {option.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-35"
              >
                Сбросить
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
                  Категории
                </h2>

                {category && (
                  <button
                    type="button"
                    onClick={() => setCategory('')}
                    className="text-xs font-bold text-white/45 transition hover:text-white"
                  >
                    Очистить
                  </button>
                )}
              </div>

              <div className="custom-scrollbar flex gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setCategory('')}
                  className={
                    category === ''
                      ? 'shrink-0 rounded-full border border-white/20 bg-white px-4 py-2 text-sm font-black text-slate-950 shadow-lg shadow-black/10 transition'
                      : 'shrink-0 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/20 hover:text-white'
                  }
                >
                  Все
                </button>

                {PROJECT_CATEGORIES.map((item) => {
                  const active = category === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(active ? '' : item)}
                      className={
                        active
                          ? 'shrink-0 rounded-full border border-[#5227FF]/50 bg-[#5227FF]/30 px-4 py-2 text-sm font-black text-white shadow-lg shadow-[#5227FF]/10'
                          : 'shrink-0 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/75 transition hover:border-white/20 hover:bg-white/20 hover:text-white'
                      }
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
                  Статус
                </h2>

                <div className="flex items-center gap-2">
                  {status && (
                    <button
                      type="button"
                      onClick={() => setStatus('')}
                      className="text-xs font-bold text-white/45 transition hover:text-white"
                    >
                      Очистить
                    </button>
                  )}

                  <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/75">
                    {loading ? 'Ищем...' : `Найдено: ${projects.length}`}
                  </div>
                </div>
              </div>

              <div className="custom-scrollbar flex gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setStatus('')}
                  className={
                    status === ''
                      ? 'shrink-0 rounded-full border border-white/20 bg-white px-4 py-2 text-sm font-black text-slate-950 shadow-lg shadow-black/10 transition'
                      : 'shrink-0 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/20 hover:text-white'
                  }
                >
                  Все
                </button>

                {STATUS_OPTIONS.map((item) => {
                  const active = status === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setStatus(active ? '' : item)}
                      className={
                        active
                          ? 'shrink-0 rounded-full border border-[#8B7CFF]/50 bg-[#8B7CFF]/20 px-4 py-2 text-sm font-black text-white shadow-lg shadow-[#8B7CFF]/10'
                          : 'shrink-0 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/75 transition hover:border-white/20 hover:bg-white/20 hover:text-white'
                      }
                    >
                      {statusLabels[item]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        </PageReveal>       
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-[28px] border border-red-400/20 bg-red-500/10 p-10 text-center text-red-100 shadow-2xl shadow-black/20 backdrop-blur-xl">
            {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="rounded-[28px] border border-white/10 bg-black/25 p-10 text-center text-white shadow-2xl shadow-black/20 backdrop-blur-xl">
            <h2 className="text-2xl font-black">Проекты не найдены</h2>

            <p className="mt-3 text-white/70">
              Попробуй изменить поиск или сбросить фильтры.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#5227FF] px-6 py-3 text-base font-bold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-500"
            >
              Сбросить фильтры
            </button>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <>
            <div
              id="projects-grid"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {projects.map((project, index) => (
                <PageReveal
                  key={project.id}
                  delay={Math.min(index * 0.06, 0.3)}
                  distance={28}
                >
                  <ProjectCard project={project} highlight={debouncedSearch} />
                </PageReveal>
              ))}
            </div>

            {!loading && !error && (
              <PageReveal delay={0.14}>
                <div id="project-map" className="mt-10 scroll-mt-32">
                  <ProjectMap projects={projects} />
                </div>
              </PageReveal>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function StatCard({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="mt-1 text-sm text-white/55">{label}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="skeleton-card rounded-[28px] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="flex gap-4">
        <div className="h-20 w-20 rounded-2xl bg-white/10" />

        <div className="flex-1 space-y-3">
          <div className="h-7 w-2/3 rounded-full bg-white/10" />
          <div className="h-4 w-full rounded-full bg-white/10" />
          <div className="h-4 w-4/5 rounded-full bg-white/10" />
        </div>
      </div>

      <div className="mt-7 flex gap-2">
        <div className="h-8 w-24 rounded-full bg-white/10" />
        <div className="h-8 w-28 rounded-full bg-white/10" />
      </div>

      <div className="mt-8 border-t border-white/10 pt-5">
        <div className="flex justify-between">
          <div className="h-9 w-32 rounded-full bg-white/10" />
          <div className="h-8 w-24 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}
