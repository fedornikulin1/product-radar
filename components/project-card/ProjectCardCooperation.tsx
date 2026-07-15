import { Project } from '@/types/project';
import { cooperationNeedLabels } from '@/lib/projectOptions';

export default function ProjectCardCooperation({ project }: { project: Project }) {
  const cooperationNeeds = (project.cooperation_needs || []).slice(0, 2);

  if (cooperationNeeds.length === 0) {
    return <div className="mt-5 min-h-[86px]" aria-hidden="true" />;
  }

  return (
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
  );
}
