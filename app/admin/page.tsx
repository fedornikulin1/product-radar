'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ColorBendsBackground from '@/components/effects/ColorBendsBackground';
import { Project } from '@/types/project';
import {
  crmPriorityLabels,
  investmentStageLabels,
} from '@/lib/projectOptions';

export default function AdminPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportingBitrix, setExportingBitrix] = useState(false);
  const [bitrixMessage, setBitrixMessage] = useState('');

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [missingDeckOnly, setMissingDeckOnly] = useState(false);
  const [missingTeamOnly, setMissingTeamOnly] = useState(false);
  const [lowReadinessOnly, setLowReadinessOnly] = useState(false);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  async function fetchProjectsData() {
    const res = await fetch('/api/projects?sort=created_at.desc');

    if (!res.ok) {
      throw new Error('Не удалось загрузить проекты');
    }

    return await res.json();
  }

  async function loadProjects() {
    setLoading(true);
    setError('');

    try {
      const data = await fetchProjectsData();
      setProjects(data);
    } catch {
      setError('Ошибка загрузки админки');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function loadInitialProjects() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchProjectsData();

        if (!ignore) {
          setProjects(data);
        }
      } catch {
        if (!ignore) {
          setError('Ошибка загрузки админки');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialProjects();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleBitrixExport() {
    setExportingBitrix(true);
    setBitrixMessage('');

    try {
      const res = await fetch('/api/bitrix24/export', {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Не удалось отправить проекты в Битрикс');
      }

      await loadProjects();
      const message =
        data.failed > 0
          ? `В Битрикс отправлено: ${data.synced}/${data.total}. Ошибок: ${data.failed}.`
          : `В Битрикс отправлено: ${data.synced}/${data.total}. Сделки обновлены.`;
      const failed = (data.results || [])
        .filter((item: { ok: boolean }) => !item.ok)
        .map((item: { title: string; error?: string }) => `${item.title}: ${item.error}`)
        .join('\n');

      setBitrixMessage(message);
      alert(failed ? `${message}\n\n${failed}` : message);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Не удалось отправить проекты в Битрикс';

      setBitrixMessage(message);
      alert(message);
    } finally {
      setExportingBitrix(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = confirm('Удалить проект?');
    if (!confirmed) return;

    const res = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      alert('Ошибка удаления');
      return;
    }

    setProjects((prev) => prev.filter((project) => project.id !== id));
  }

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const q = search.trim().toLowerCase();

      if (
        q &&
        !(
          project.title.toLowerCase().includes(q) ||
          project.short_description.toLowerCase().includes(q) ||
          project.city.toLowerCase().includes(q)
        )
      ) {
        return false;
      }

      if (priorityFilter && project.crm?.priority !== priorityFilter) {
        return false;
      }

      if (
        visibilityFilter === 'public' &&
        project.crm?.status !== 'ready_for_showcase'
      ) {
        return false;
      }

      if (
        visibilityFilter === 'hidden' &&
        project.crm?.status === 'ready_for_showcase'
      ) {
        return false;
      }

      if (missingDeckOnly && project.presentation_url) {
        return false;
      }

      if (
        missingTeamOnly &&
        (project.team_members?.length || 0) > 0
      ) {
        return false;
      }

      if (lowReadinessOnly && (project.readiness_score || 0) >= 50) {
        return false;
      }

      return true;
    });
  }, [
    projects,
    search,
    priorityFilter,
    visibilityFilter,
    missingDeckOnly,
    missingTeamOnly,
    lowReadinessOnly,
  ]);

  const stats = useMemo(() => {
    return {
      total: projects.length,
      highPriority: projects.filter((p) => p.crm?.priority === 'high').length,
      noDeck: projects.filter((p) => !p.presentation_url).length,
      noTeam: projects.filter((p) => !p.team_members?.length).length,
      lowReadiness: projects.filter((p) => (p.readiness_score || 0) < 50).length,
      hidden: projects.filter((p) => p.crm?.status !== 'ready_for_showcase').length,
    };
  }, [projects]);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 md:px-8 md:py-10">
      <ColorBendsBackground />

      <section className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-8 rounded-[34px] border border-white/10 bg-black/35 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-xl md:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm font-medium text-white/90">
                Admin / CRM
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                Админ-панель
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/72">
                Управление проектами, видимостью, заполненностью карточек,
                материалами и
                внутренними приоритетами.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/new"
                className="inline-flex h-12 min-w-40 items-center justify-center rounded-2xl bg-[#5227FF] px-5 text-sm font-black text-white shadow-lg shadow-[#5227FF]/15 transition hover:bg-indigo-500"
              >
                Добавить проект
              </Link>

              <button
                type="button"
                onClick={handleBitrixExport}
                disabled={exportingBitrix}
                title="Отправить текущие проекты сайта в сделки и компании Битрикс24"
                className="inline-flex h-12 min-w-44 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-black text-white/75 transition hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-60"
              >
                {exportingBitrix ? 'Отправка...' : 'В Битрикс'}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-12 min-w-32 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-normal text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Выйти
              </button>
            </div>
          </div>

          {bitrixMessage && (
            <div className="mt-5 rounded-2xl border border-cyan-200/15 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-50">
              {bitrixMessage}
            </div>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <StatCard value={stats.total} label="Всего проектов" />
            <StatCard value={stats.highPriority} label="High priority" />
            <StatCard value={stats.noDeck} label="Без презентации" />
            <StatCard value={stats.noTeam} label="Без команды" />
            <StatCard value={stats.lowReadiness} label="Низкая заполненность" />
            <StatCard value={stats.hidden} label="Скрытые" />
          </div>
        </header>

        <section className="mb-8 rounded-[30px] border border-white/10 bg-black/35 p-4 text-white shadow-2xl shadow-black/25 backdrop-blur-2xl">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_220px] lg:items-end">
            <div>
              <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-white/45">
                Поиск
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Название, описание, город..."
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/95 px-4 text-base font-medium text-slate-950 outline-none transition focus:border-[#5227FF]"
              />
            </div>

            <FilterSelect
              label="Приоритет"
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { value: 'low', label: 'Низкий' },
                { value: 'medium', label: 'Средний' },
                { value: 'high', label: 'Высокий' },
              ]}
            />

            <FilterSelect
              label="Видимость"
              value={visibilityFilter}
              onChange={setVisibilityFilter}
              options={[
                { value: 'public', label: 'Публичные' },
                { value: 'hidden', label: 'Скрытые' },
              ]}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <ToggleChip
              checked={missingDeckOnly}
              onChange={setMissingDeckOnly}
              label="Без презентации"
            />
            <ToggleChip
              checked={missingTeamOnly}
              onChange={setMissingTeamOnly}
              label="Без команды"
            />
            <ToggleChip
              checked={lowReadinessOnly}
              onChange={setLowReadinessOnly}
              label="Заполненность < 50%"
            />
          </div>
        </section>

        {loading && (
          <div className="rounded-[28px] border border-white/10 bg-black/35 p-10 text-center text-white/70 shadow-2xl shadow-black/20 backdrop-blur-xl">
            Загружаем проекты...
          </div>
        )}

        {error && (
          <div className="rounded-[28px] border border-red-400/20 bg-red-500/10 p-10 text-center text-red-100 shadow-2xl shadow-black/20 backdrop-blur-xl">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/35 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-white">
                <thead className="border-b border-white/10 bg-black/30">
                  <tr>
                    <th className="px-5 py-4 text-sm font-black text-white/65">Проект</th>
                    <th className="px-5 py-4 text-sm font-black text-white/65">Стадия</th>
                    <th className="px-5 py-4 text-sm font-black text-white/65">Заполненность</th>
                    <th className="px-5 py-4 text-sm font-black text-white/65">Deck</th>
                    <th className="px-5 py-4 text-sm font-black text-white/65">CRM</th>
                    <th className="px-5 py-4 text-sm font-black text-white/65">Действия</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProjects.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-white/10 align-middle last:border-b-0"
                    >
                      <td className="px-5 py-5">
                        <div className="flex min-h-20 items-center gap-4">
                          {project.logo_url ? (
                            <Image
                              src={project.logo_url}
                              alt={project.title}
                              width={56}
                              height={56}
                              unoptimized
                              className="h-14 w-14 rounded-2xl object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-lg font-black text-white">
                              {project.title?.[0] || '?'}
                            </div>
                          )}

                          <div>
                            <div className="text-lg font-black text-white">
                              {project.title}
                            </div>
                            <div className="mt-1 max-w-[320px] text-sm text-white/55">
                              {project.short_description}
                            </div>
                            <div className="mt-2 text-xs text-white/40">
                              {project.city || 'Город не указан'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="inline-flex min-h-8 items-center rounded-full border border-[#5227FF]/30 bg-[#5227FF]/15 px-3 py-1 text-xs font-black text-violet-100">
                          {investmentStageLabels[project.investment_stage]}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="min-w-[120px]">
                          <div className="mb-2 text-sm font-black text-white">
                            {project.readiness_score || 0}%
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#5227FF] via-[#8B7CFF] to-emerald-300"
                              style={{ width: `${project.readiness_score || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={
                            project.presentation_url
                              ? 'inline-flex min-h-8 items-center rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-100'
                              : 'rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-black text-white/60'
                          }
                        >
                          {project.presentation_url ? 'Есть' : 'Нет'}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="space-y-2">
                          <div
  className={
    project.crm?.priority === 'high'
      ? 'inline-flex min-h-8 items-center rounded-full border border-red-300/20 bg-red-400/10 px-3 py-1 text-xs font-black text-red-100'
      : project.crm?.priority === 'medium'
        ? 'inline-flex min-h-8 items-center rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-100'
        : 'inline-flex min-h-8 items-center rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-black text-white/75'
  }
>
  {crmPriorityLabels[project.crm?.priority || 'medium']}
</div>

                          <div
                            className={
                              project.crm?.status === 'ready_for_showcase'
                                ? 'inline-flex min-h-8 items-center rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-100'
                                : 'inline-flex min-h-8 items-center rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-100'
                            }
                          >
                            {project.crm?.status === 'ready_for_showcase'
                              ? 'Публичный'
                              : 'Скрыт'}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/projects/${project.id}`}
                            className="inline-flex h-10 w-40 items-center justify-center rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-bold text-white/80 transition hover:bg-white/20"
                          >
                            Открыть
                          </Link>

                          <Link
                            href={`/admin/edit/${project.id}`}
                            className="inline-flex h-10 w-40 items-center justify-center rounded-xl bg-[#5227FF] px-4 text-sm font-black text-white transition hover:bg-indigo-500"
                          >
                            Редактировать
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(project.id)}
                            className="inline-flex h-10 w-40 items-center justify-center rounded-xl bg-red-500 px-4 text-sm font-black text-white transition hover:bg-red-400"
                          >
                            Удалить
                          </button>
                        </div>

                        {project.crm?.owner && (
                          <div className="mt-3 text-xs text-white/45">
                            Ответственный: {project.crm.owner}
                          </div>
                        )}

                        {project.crm?.next_action && (
                          <div className="mt-1 text-xs text-white/45">
                            Next: {project.crm.next_action}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!loading && !error && filteredProjects.length === 0 && (
              <div className="p-10 text-center text-white/60">
                Ничего не найдено по текущим фильтрам.
              </div>
            )}
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
        className="h-12 w-full rounded-2xl border border-white/10 bg-white/95 px-4 text-base font-medium text-slate-950 outline-none transition focus:border-[#5227FF]"
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

function ToggleChip({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={
        checked
          ? 'inline-flex h-11 items-center justify-center rounded-2xl border border-[#5227FF]/40 bg-[#5227FF]/25 px-4 text-sm font-black text-white'
          : 'inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-bold text-white/75 transition hover:bg-white/20 hover:text-white'
      }
    >
      {label}
    </button>
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
    <div className="flex min-h-24 flex-col justify-between rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="mt-1 text-sm text-white/55">{label}</div>
    </div>
  );
}
