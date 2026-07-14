'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@/types/project';
import {
  audienceTypeLabels,
  cooperationNeedLabels,
  getPlacementTypes,
  investmentStageLabels,
  placementTypeLabels,
  priceLabels,
  statusLabels,
} from '@/lib/projectOptions';

function getAudienceTypes(project: Project) {
  if (project.audience_types?.length) {
    return project.audience_types;
  }

  if (project.audience_type === 'b2b_b2c') {
    return ['b2b', 'b2c'] as const;
  }

  if (project.audience_type) {
    return [project.audience_type];
  }

  return ['b2b'] as const;
}

export default function ProjectCard({
  project,
  highlight = '',
}: {
  project: Project;
  highlight?: string;
}) {
  const stageLabel = investmentStageLabels[project.investment_stage || 'pre_seed'];
  const audienceTypes = getAudienceTypes(project);
  const placementLabel = getPlacementTypes(project)
    .map((type) => placementTypeLabels[type])
    .join(' + ');

  const cooperationNeeds = (project.cooperation_needs || []).slice(0, 2);

  return (
    <div className="h-full rounded-[28px] border border-white/15 bg-slate-950/58 shadow-2xl shadow-black/20 backdrop-blur-xl transition duration-300 hover:scale-[1.025] hover:border-cyan-200/25 hover:bg-slate-950/66 hover:shadow-cyan-950/30">
      <Link
        href={`/projects/${project.id}`}
        scroll={true}
        className="relative z-[3] flex h-full min-h-[430px] flex-col rounded-[28px] p-6 text-white"
      >
        <div className="flex min-h-[132px] gap-4">
          {project.logo_url ? (
            <Image
              src={project.logo_url}
              alt={project.title}
              width={80}
              height={80}
              unoptimized
              className="h-20 w-20 shrink-0 rounded-2xl object-cover shadow-lg shadow-black/20"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-3xl font-black text-white shadow-lg shadow-black/20">
              {project.title?.[0] || '?'}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-2xl font-black tracking-tight text-white">
              <HighlightedText text={project.title || ''} query={highlight} />
            </h3>

            <p className="mt-2 line-clamp-3 text-base leading-relaxed text-white/70">
              <HighlightedText
                text={project.short_description || ''}
                query={highlight}
              />
            </p>
          </div>
        </div>

        <div className="mt-6 flex min-h-[58px] content-start flex-wrap gap-2">
          {audienceTypes.map((type) => (
            <span
              key={type}
              className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-100 shadow-lg shadow-emerald-950/10 backdrop-blur"
            >
              {audienceTypeLabels[type]}
            </span>
          ))}

          <span className="rounded-full border border-[#5227FF]/40 bg-[#5227FF]/25 px-3 py-1 text-xs font-black text-violet-100 shadow-lg shadow-[#5227FF]/10">
            {stageLabel}
          </span>

          {placementLabel && (
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-white/80">
              {placementLabel}
            </span>
          )}

          {(project.categories || []).slice(0, 2).map((category) => (
            <span
              key={category}
              className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-white/75"
            >
              {category}
            </span>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <MetricBadge
            label="Материалы"
            value={
              project.presentation_url || project.gallery_urls.length > 0
                ? 'Есть'
                : 'Нет'
            }
          />

          <MetricBadge
            label="Модель оплаты"
            value={priceLabels[project.price]}
            accent="border-cyan-200/15 bg-cyan-300/10 text-cyan-50"
          />
        </div>

        {cooperationNeeds.length > 0 ? (
          <div className="mt-5 min-h-[86px]">
            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/35">
              Сотрудничество
            </div>

            <div className="flex flex-wrap gap-2">
              {cooperationNeeds.map((need) => (
                <span
                  key={need}
                  className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-black text-amber-100"
                >
                  {cooperationNeedLabels[need]}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5 min-h-[86px]" aria-hidden="true" />
        )}

        <div className="mt-auto border-t border-white/10 pt-5">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-white/80">
              {statusLabels[project.status]}
            </span>

            <span className="max-w-[58%] truncate text-right text-sm font-black text-white/80">
              {project.investment_amount || 'Инвестиции уточняются'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

function MetricBadge({
  label,
  value,
  accent = 'border-white/10 bg-black/20 text-white/80',
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className={`rounded-2xl border px-3 py-3 ${accent}`}>
      <div className="text-[10px] font-black uppercase tracking-[0.16em] opacity-60">
        {label}
      </div>
      <div className="mt-1 text-sm font-black">{value}</div>
    </div>
  );
}

function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const cleanQuery = query.trim();

  if (!cleanQuery) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const lowerQuery = cleanQuery.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return <>{text}</>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + cleanQuery.length);
  const after = text.slice(index + cleanQuery.length);

  return (
    <>
      {before}
      <mark className="rounded-md bg-[#5227FF]/35 px-1 font-black text-white">
        {match}
      </mark>
      {after}
    </>
  );
}
