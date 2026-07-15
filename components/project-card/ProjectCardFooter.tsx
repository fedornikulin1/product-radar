import { Project } from '@/types/project';
import { statusLabels } from '@/lib/projectOptions';

export default function ProjectCardFooter({ project }: { project: Project }) {
  return (
    <div className="mt-auto border-t border-white/10 pt-5">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-white/80">
          {statusLabels[project.status]}
        </span>

        <span className="max-w-[62%] truncate text-right text-base font-black text-white md:text-lg">
          {project.investment_amount || 'Инвестиции уточняются'}
        </span>
      </div>
    </div>
  );
}
