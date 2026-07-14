'use client';
import PageReveal from '@/components/PageReveal';
import { useEffect, useMemo, useState } from 'react';
import ProjectCard from '@/components/ProjectCard';
import ColorBendsBackground from '@/components/effects/ColorBendsBackground';
import { Project } from '@/types/project';
import {
  STATUS_OPTIONS,
  statusLabels,
} from '@/lib/projectOptions';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasActiveFilters = Boolean(
    search || categories.length > 0 || statuses.length > 0,
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
    categories.forEach((category) => params.append('category', category));
    statuses.forEach((status) => params.append('status', status));
    params.set('sort', 'created_at.desc');

    return params.toString();
  }, [debouncedSearch, categories, statuses]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');

        if (!res.ok) return;

        const data = await res.json();
        setCategoryOptions(Array.isArray(data) ? data : []);
      } catch {
        setCategoryOptions([]);
      }
    }

    loadCategories();
  }, []);

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
    setCategories([]);
    setCategorySearch('');
    setStatuses([]);
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

  const projectsWithPresentation = projects.filter(
    (item) => Boolean(item.presentation_url),
  ).length;

  const projectsLookingForInvestment = projects.filter((item) =>
    (item.cooperation_needs || []).includes('investment'),
  ).length;

  const filteredCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();

    if (!query) return categoryOptions;

    return categoryOptions.filter((item) =>
      item.toLowerCase().includes(query),
    );
  }, [categoryOptions, categorySearch]);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 md:px-8 md:py-10">
      <ColorBendsBackground />

      <section className="relative z-10 mx-auto max-w-7xl">
        <PageReveal delay={0}>
          <header className="mb-8 rounded-[34px] border border-white/10 bg-black/35 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-xl md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
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

            <div className="rounded-[30px] border border-white/10 bg-black/35 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                    Навигатор
                  </div>

                  <div className="mt-2 text-2xl font-black text-white">
                    Быстрый обзор проектов
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <StatCard value={projects.length} label="Проектов" />
                <StatCard value={citiesCount} label="Городов" />
                <StatCard value={projectsWithPresentation} label="С презентацией" />
                <StatCard value={projectsLookingForInvestment} label="Ищут инвестиции" />
              </div>
            </div>
          </div>
        </header>
        </PageReveal>
        <PageReveal delay={0.08} className="relative z-[120]">
          <section className="sticky top-24 z-50 mb-10 rounded-[30px] border border-white/10 bg-black/35 p-4 text-white shadow-2xl shadow-black/25 backdrop-blur-2xl">
            <div className="grid gap-4 lg:grid-cols-[1fr_320px_260px_auto] lg:items-start">
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

              <MultiSelectFilter
                title="Категории"
                placeholder="Поиск категории..."
                options={filteredCategories}
                selected={categories}
                search={categorySearch}
                onSearch={setCategorySearch}
                onChange={setCategories}
                emptyText="Категории не найдены"
              />

              <MultiSelectFilter
                title="Статус"
                placeholder="Выбрать статус..."
                options={STATUS_OPTIONS}
                selected={statuses}
                onChange={setStatuses}
                labelsMap={statusLabels}
              />

              <div className="flex gap-2 lg:justify-end">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center text-sm font-bold text-white/75 lg:min-w-36">
                  {loading ? 'Ищем...' : `Найдено: ${projects.length}`}
                </div>

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
          <div className="rounded-[28px] border border-white/10 bg-black/35 p-10 text-center text-white shadow-2xl shadow-black/20 backdrop-blur-xl">
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
              className="relative z-0 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="mt-1 text-sm text-white/55">{label}</div>
    </div>
  );
}

function MultiSelectFilter({
  title,
  placeholder,
  options,
  selected,
  search = '',
  onSearch,
  onChange,
  labelsMap,
  emptyText = 'Ничего не найдено',
}: {
  title: string;
  placeholder: string;
  options: readonly string[];
  selected: string[];
  search?: string;
  onSearch?: (value: string) => void;
  onChange: (value: string[]) => void;
  labelsMap?: Record<string, string>;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);

  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
      return;
    }

    onChange([...selected, option]);
  }

  const label = selected.length
    ? selected.map((item) => labelsMap?.[item] ?? item).join(', ')
    : placeholder;

  return (
    <div className={open ? 'relative z-[140]' : 'relative'}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-14 w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/95 px-4 text-left text-sm font-bold text-slate-950 shadow-lg shadow-black/10 outline-none transition hover:bg-white"
      >
        <span className={selected.length ? 'truncate' : 'truncate text-slate-400'}>
          {label}
        </span>
        <span className="text-slate-400">⌄</span>
      </button>

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className="rounded-full border border-[#5227FF]/40 bg-[#5227FF]/25 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-[#5227FF]/40"
            >
              {labelsMap?.[item] ?? item} ×
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-[150] w-full overflow-hidden rounded-2xl border border-white/20 bg-slate-950 p-3 shadow-2xl shadow-black/70">
          <div className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-white/45">
            {title}
          </div>

          {onSearch && (
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder={placeholder}
              className="mb-2 h-11 w-full rounded-xl border border-white/10 bg-white/95 px-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-[#5227FF]"
            />
          )}

          <div className="custom-scrollbar max-h-56 space-y-1 overflow-y-auto pr-1">
            {options.map((option) => {
              const active = selected.includes(option);

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggle(option)}
                  className={
                    active
                      ? 'flex w-full items-center justify-between rounded-xl bg-[#5227FF] px-3 py-2 text-left text-sm font-bold text-white'
                      : 'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white'
                  }
                >
                  <span>{labelsMap?.[option] ?? option}</span>
                  {active && <span>✓</span>}
                </button>
              );
            })}

            {options.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/50">
                {emptyText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="skeleton-card rounded-[28px] border border-white/10 bg-black/35 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
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
