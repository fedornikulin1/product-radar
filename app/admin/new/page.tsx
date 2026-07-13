'use client';

import ColorBendsBackground from '@/components/effects/ColorBendsBackground';
import ProjectForm from '@/components/ProjectForm';

export default function NewProjectPage() {
  return (
    <main className="relative min-h-screen px-4 py-6 md:px-8 md:py-10">
      <ColorBendsBackground />

      <section className="relative z-10 mx-auto max-w-6xl">
        <div className="fade-up mb-8 rounded-[34px] border border-white/10 bg-black/35 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-xl md:p-8">
          <a
            href="/admin"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/80 transition hover:bg-white/20 hover:text-white"
          >
            ← В админку
          </a>

          <h1 className="mt-5 text-5xl font-black tracking-tight text-white md:text-6xl">
            Добавить проект
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/70">
            Заполни карточку проекта. После создания он появится на главной странице каталога.
          </p>
        </div>

        <ProjectForm mode="create" />
      </section>
    </main>
  );
}
