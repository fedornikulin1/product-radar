import { Project } from '@/types/project';
import {
  audienceTypeLabels,
  getPlacementTypes,
  investmentStageLabels,
  placementTypeLabels,
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

export default function ProjectCardTags({ project }: { project: Project }) {
  const stageLabel = investmentStageLabels[project.investment_stage || 'pre_seed'];
  const audienceTypes = getAudienceTypes(project);
  const placementLabel = getPlacementTypes(project)
    .map((type) => placementTypeLabels[type])
    .join(' + ');

  return (
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
  );
}
