'use client';

import Link from 'next/link';
import { Project } from '@/types/project';
import ProjectCardCooperation from './project-card/ProjectCardCooperation';
import ProjectCardFooter from './project-card/ProjectCardFooter';
import ProjectCardHeader from './project-card/ProjectCardHeader';
import ProjectCardMetrics from './project-card/ProjectCardMetrics';
import ProjectCardTags from './project-card/ProjectCardTags';

export default function ProjectCard({
  project,
  highlight = '',
  onOpen,
}: {
  project: Project;
  highlight?: string;
  onOpen?: (project: Project) => void;
}) {
  const content = (
    <>
      <ProjectCardHeader
        title={project.title}
        description={project.short_description}
        logoUrl={project.logo_url}
        highlight={highlight}
      />
      <ProjectCardTags project={project} />
      <ProjectCardMetrics project={project} />
      <ProjectCardCooperation project={project} />
      <ProjectCardFooter project={project} />
    </>
  );

  return (
    <div className="h-full rounded-[28px] border border-white/15 bg-slate-950/58 shadow-2xl shadow-black/20 backdrop-blur-xl transition duration-300 hover:scale-[1.025] hover:border-cyan-200/25 hover:bg-slate-950/66 hover:shadow-cyan-950/30">
      {onOpen ? (
        <button
          type="button"
          onClick={() => onOpen(project)}
          className="relative z-[3] flex h-full min-h-[430px] w-full flex-col rounded-[28px] p-6 text-left text-white"
        >
          {content}
        </button>
      ) : (
        <Link
          href={`/projects/${project.id}`}
          scroll={true}
          className="relative z-[3] flex h-full min-h-[430px] flex-col rounded-[28px] p-6 text-white"
        >
          {content}
        </Link>
      )}
    </div>
  );
}
