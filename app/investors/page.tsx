'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ProjectCard from '@/components/ProjectCard';
import PageReveal from '@/components/PageReveal';
import ColorBendsBackground from '@/components/effects/ColorBendsBackground';
import {
  Project,
  AudienceType,
  CooperationNeed,
  PlacementType,
} from '@/types/project';
import {
  AUDIENCE_TYPE_OPTIONS,
  COOPERATION_NEED_OPTIONS,
  INVESTMENT_STAGE_OPTIONS,
  PLACEMENT_TYPE_OPTIONS,
  audienceTypeLabels,
  cooperationNeedLabels,
  getPlacementTypes,
  investmentStageLabels,
  placementTypeLabels,
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

export default function InvestorsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stage, setStage] = useState('');
  const [audience, setAudience] = useState('');
  const [placement, setPlacement] = useState('');
  const [need, setNeed] = useState<CooperationNeed | ''>('');
  const [presentationOnly, setPresentationOnly] = useState(false);
  const [teamOnly, setTeamOnly] = useState(false);
  const [minReadiness, setMinReadiness] = useState(0);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      setError('');

      try {
        const res = await fetch('/api/projects?sort=created_at.desc');

        if (!res.ok) {
          throw new Error('Не удалось загрузить проекты');
        }

        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch {
        setError('Не удалось загрузить проекты для инвесторов');
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (stage && project.investment_stage !== stage) return false;

      if (audience) {
        const audiences = getAudienceTypes(project);
        if (!audiences.includes(audience as AudienceType)) return false;
      }

      if (
        placement &&
        !getPlacementTypes(project).includes(placement as PlacementType)
      ) return false;

      if (need) {
        const cooperationNeeds = project.cooperation_needs || [];
        if (!cooperationNeeds.includes(need)) return false;
      }

      if (presentationOnly && !project.presentation_url) return false;

      if (teamOnly) {
        const hasTeam = Boolean(project.team_members?.length);
        if (!hasTeam) return false;
      }

      if ((project.readiness_score || 0) < minReadiness) return false;

      return true;
    });
  }, [
    projects,
    stage,
    audience,
    placement,
    need,
    presentationOnly,
    teamOnly,
    minReadiness,
  ]);

  const stats = useMemo(() => {
    const withPresentation = filteredProjects.filter((p) => Boolean(p.presentation_url)).length;
    const avgReadiness = filteredProjects.length
      ? Math.round(
          filteredProjects.reduce(
            (sum, project) => sum + (project.readiness_score || 0),
            0,
          ) / filteredProjects.length,
        )
      : 0;

    return {
      count: filteredProjects.length,
      withPresentation,
      avgReadiness,
    };
  }, [filteredProjects]);

  function resetFilters() {
    setStage('');
    setAudience('');
    setPlacement('');
    setNeed('');
    setPresentationOnly(false);
    setTeamOnly(false);
    setMinReadiness(0);
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 md:px-8 md:py-10">
      <ColorBendsBackground />

      <section className="relative z-10 mx-auto max-w-7xl">
        <PageReveal delay={0}>
          <header className="mb-8 rounded-[34px] border border-white/10 bg-black/35 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-xl md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm font-medium text-white/90">
                  Investor view
                </div>

                <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                  Для инвесторов
                </h1>

                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/72">
                  Быстрый обзор проектов компании: стадии, рынок, материалы,
                  команда, готовность и запросы по сотрудничеству.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-white/80 transition hover:bg-white/20 hover:text-white"
                  >
                    На главную
                  </Link>

                  <a
                    href="#investor-projects"
                    className="inline-flex items-center justify-center rounded-2xl bg-[#5227FF] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#5227FF]/15 transition hover:bg-indigo-500"
                  >
                    Смотреть проекты
                  </a>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard value={stats.count} label="Подходящих проектов" />
                <StatCard value={stats.withPresentation} label="С презентацией" />
                <StatCard value={`${stats.avgReadiness}%`} label="Средняя готовность" />
              </div>
            </div>
          </header>
        </PageReveal>

        <PageReveal delay={0.06}>
          <section className="mb-8 rounded-[30px] border border-white/10 bg-black/35 p-4 text-white shadow-2xl shadow-black/25 backdrop-blur-2xl">
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setNeed('investment');
                  setPresentationOnly(true);
                  setMinReadiness(40);
                }}
                className="rounded-full border border-[#5227FF]/35 bg-[#5227FF]/20 px-4 py-2 text-sm font-black text-white transition hover:bg-[#5227FF]/30"
              >
                Готовые к инвестициям
              </button>

              <button
                type="button"
                onClick={() => {
                  setNeed('pilot');
                  setPresentationOnly(false);
                  setMinReadiness(30);
                }}
                className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/80 transition hover:bg-white/20 hover:text-white"
              >
                Ищут пилот
              </button>

              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/80 transition hover:bg-white/20 hover:text-white"
              >
                Сбросить всё
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
              <FilterSelect
                label="Стадия"
                value={stage}
                onChange={setStage}
                options={INVESTMENT_STAGE_OPTIONS.map((item) => ({
                  value: item,
                  label: investmentStageLabels[item],
                }))}
              />

              <FilterSelect
                label="Рынок"
                value={audience}
                onChange={setAudience}
                options={AUDIENCE_TYPE_OPTIONS.map((item) => ({
                  value: item,
                  label: audienceTypeLabels[item],
                }))}
              />

              <FilterSelect
                label="Размещение"
                value={placement}
                onChange={setPlacement}
                options={PLACEMENT_TYPE_OPTIONS.map((item) => ({
                  value: item,
                  label: placementTypeLabels[item],
                }))}
              />

              <FilterSelect
                label="Запрос"
                value={need}
                onChange={(value) => setNeed(value as CooperationNeed | '')}
                options={COOPERATION_NEED_OPTIONS.map((item) => ({
                  value: item,
                  label: cooperationNeedLabels[item],
                }))}
              />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
              <div>
                <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-white/45">
                  Минимальная готовность
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={10}
                    value={minReadiness}
                    onChange={(e) => setMinReadiness(Number(e.target.value))}
                    className="w-full accent-[#5227FF]"
                  />

                  <div className="min-w-[64px] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center text-sm font-black text-white">
                    {minReadiness}%
                  </div>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white/80">
                <input
                  type="checkbox"
                  checked={presentationOnly}
                  onChange={(e) => setPresentationOnly(e.target.checked)}
                  className="accent-[#5227FF]"
                />
                Только с презентацией
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white/80">
                <input
                  type="checkbox"
                  checked={teamOnly}
                  onChange={(e) => setTeamOnly(e.target.checked)}
                  className="accent-[#5227FF]"
                />
                Только с командой
              </label>
            </div>
          </section>
        </PageReveal>

        {loading && (
          <PageReveal delay={0.1}>
            <div className="rounded-[28px] border border-white/10 bg-black/35 p-10 text-center text-white/70 shadow-2xl shadow-black/20 backdrop-blur-xl">
              Загружаем проекты...
            </div>
          </PageReveal>
        )}

        {error && (
          <PageReveal delay={0.1}>
            <div className="rounded-[28px] border border-red-400/20 bg-red-500/10 p-10 text-center text-red-100 shadow-2xl shadow-black/20 backdrop-blur-xl">
              {error}
            </div>
          </PageReveal>
        )}

        {!loading && !error && filteredProjects.length === 0 && (
          <PageReveal delay={0.1}>
            <div className="rounded-[28px] border border-white/10 bg-black/35 p-10 text-center text-white shadow-2xl shadow-black/20 backdrop-blur-xl">
              <h2 className="text-2xl font-black">Ничего не найдено</h2>
              <p className="mt-3 text-white/70">
                Попробуй ослабить фильтры для инвесторской выдачи.
              </p>
            </div>
          </PageReveal>
        )}

        {!loading && !error && filteredProjects.length > 0 && (
          <div
            id="investor-projects"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredProjects.map((project, index) => (
              <PageReveal
                key={project.id}
                delay={Math.min(index * 0.06, 0.3)}
                distance={28}
              >
                <ProjectCard project={project} />
              </PageReveal>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-white/45">
        {label}
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 w-full rounded-2xl border border-white/10 bg-white/95 px-4 text-base font-medium text-slate-950 outline-none transition focus:border-[#5227FF]"
      >
        <option value="">Все</option>
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
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
