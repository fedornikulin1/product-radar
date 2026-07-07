'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ColorBendsBackground from '@/components/effects/ColorBendsBackground';
import ProjectForm from '@/components/ProjectForm';
import { Project } from '@/types/project';

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${params.id}`);

        if (!res.ok) {
          throw new Error('Проект не найден');
        }

        const data = await res.json();

        setProject(data);
      } catch {
        setError('Проект не найден');
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [params.id]);

  if (loading) {
    return (
      <main className="relative min-h-screen px-4 py-6 md:px-8 md:py-10">
        <ColorBendsBackground />

        <section className="relative z-10 mx-auto max-w-5xl">
          <div className="rounded-[30px] border border-white/10 bg-black/25 p-10 text-center text-white/70 shadow-2xl shadow-black/20 backdrop-blur-xl">
            Загрузка проекта...
          </div>
        </section>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="relative min-h-screen px-4 py-6 md:px-8 md:py-10">
        <ColorBendsBackground />

        <section className="relative z-10 mx-auto max-w-5xl">
          <div className="rounded-[30px] border border-red-400/20 bg-red-500/10 p-10 text-center text-red-100 shadow-2xl shadow-black/20 backdrop-blur-xl">
            {error || 'Проект не найден'}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen px-4 py-6 md:px-8 md:py-10">
      <ColorBendsBackground />

      <section className="relative z-10 mx-auto max-w-5xl">
        <div className="fade-up mb-8 rounded-[34px] border border-white/10 bg-black/25 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-xl md:p-8">
          <a
            href={`/projects/${project.id}`}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/80 transition hover:bg-white/20 hover:text-white"
          >
            ← Назад к проекту
          </a>

          <h1 className="mt-5 text-5xl font-black tracking-tight text-white md:text-6xl">
            Редактировать проект
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/70">
            Обнови данные проекта, изображения, описание, статус или ссылки.
          </p>
        </div>

        <ProjectForm mode="edit" project={project} />
      </section>
    </main>
  );
}