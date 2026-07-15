import Image from 'next/image';
import HighlightedText from './HighlightedText';

export default function ProjectCardHeader({
  title,
  description,
  logoUrl,
  highlight,
}: {
  title: string;
  description: string;
  logoUrl: string;
  highlight: string;
}) {
  return (
    <div className="flex min-h-[132px] gap-4">
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={title}
          width={80}
          height={80}
          unoptimized
          className="h-20 w-20 shrink-0 rounded-2xl object-cover shadow-lg shadow-black/20"
        />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-3xl font-black text-white shadow-lg shadow-black/20">
          {title?.[0] || '?'}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-2xl font-black tracking-tight text-white">
          <HighlightedText text={title || ''} query={highlight} />
        </h3>

        <p className="mt-2 line-clamp-3 text-base leading-relaxed text-white/70">
          <HighlightedText text={description || ''} query={highlight} />
        </p>
      </div>
    </div>
  );
}
