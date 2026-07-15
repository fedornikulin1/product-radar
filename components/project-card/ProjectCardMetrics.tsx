import { Project } from '@/types/project';
import { priceLabels } from '@/lib/projectOptions';

export default function ProjectCardMetrics({ project }: { project: Project }) {
  return (
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
