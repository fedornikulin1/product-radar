'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const [aboutMounted, setAboutMounted] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);

  useEffect(() => {
    function scrollToHashTarget() {
      const hash = window.location.hash;

      if (!hash) return;

      const element = document.querySelector(hash);

      if (!element) return;

      setTimeout(() => {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 80);
    }

    scrollToHashTarget();
    window.addEventListener('hashchange', scrollToHashTarget);

    return () => {
      window.removeEventListener('hashchange', scrollToHashTarget);
    };
  }, []);

  useEffect(() => {
    function openFromAnywhere() {
      openAbout();
    }

    window.addEventListener('open-about-modal', openFromAnywhere);

    return () => {
      window.removeEventListener('open-about-modal', openFromAnywhere);
    };
  }, []);

  useEffect(() => {
    if (!aboutMounted) return;

    function handleEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeAbout();
      }
    }

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [aboutMounted]);

  function openAbout() {
    setAboutMounted(true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAboutVisible(true);
      });
    });
  }

  function closeAbout() {
    setAboutVisible(false);

    setTimeout(() => {
      setAboutMounted(false);
    }, 220);
  }

  function handleScrollTop() {
    if (pathname !== '/') {
      router.push('/');
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  function handleScrollToMap() {
    if (pathname !== '/') {
      router.push('/#project-map');
      return;
    }

    const element = document.getElementById('project-map');

    if (!element) return;

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  const navItemClass =
    'inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap px-3 !text-base !font-normal !text-white/60 transition hover:!text-white';

  return (
    <>
      <header className="sticky top-4 z-50 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[28px] border border-white/10 bg-black/35 px-4 py-3 text-white shadow-2xl shadow-black/20 backdrop-blur-2xl md:px-6">
            <div className="flex min-w-0 items-center gap-5">
              <button
                type="button"
                onClick={handleScrollTop}
                className="flex shrink-0 items-center gap-3 text-left transition hover:opacity-90"
              >
                <Image
                  src="/brand/yakutia-corp-icon.png"
                  alt="Корпорация развития Республики Саха (Якутия)"
                  width={44}
                  height={44}
                  priority
                  className="h-11 w-11 shrink-0 object-contain"
                />

                <div className="hidden min-w-0 sm:block">
                  <div className="max-w-64 text-sm font-bold leading-tight text-white">
                    Корпорация развития Республики Саха (Якутия)
                  </div>

                  <div className="hidden text-xs text-white/50 sm:block">
                    Навигатор проектов
                  </div>
                </div>
              </button>

              <nav className="ml-auto flex min-w-0 items-center gap-2 py-1">
                <button
                  type="button"
                  onClick={handleScrollTop}
                  className={navItemClass}
                >
                  Главная
                </button>

                <button
                  type="button"
                  onClick={handleScrollToMap}
                  className={navItemClass}
                >
                  Карта проектов
                </button>

                <Link
                  href="/investors"
                  className={navItemClass}
                >
                  Инвесторам
                </Link>

                <button
                  type="button"
                  onClick={openAbout}
                  className={navItemClass}
                >
                  О нас
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {aboutMounted && (
        <div
          className={`fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md transition duration-200 ${
            aboutVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeAbout}
        >
          <div
            className={`custom-scrollbar max-h-[calc(100vh-2rem)] w-full max-w-5xl overflow-y-auto rounded-[34px] border border-white/10 bg-black/70 p-6 text-white shadow-2xl shadow-black/30 backdrop-blur-2xl transition duration-200 md:p-9 ${
              aboutVisible
                ? 'translate-y-0 scale-100 opacity-100'
                : 'translate-y-4 scale-[0.98] opacity-0'
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-5">
              <div className="max-w-3xl">
                <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/55">
                  О корпорации
                </div>

                <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
                  Корпорация развития Республики Саха (Якутия)
                </h2>

                <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
                  Единое окно для инвесторов и инициаторов проектов. Корпорация
                  помогает превращать перспективные идеи в устойчивые проекты,
                  объединяя бизнес, органы власти и институты развития.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAbout}
                aria-label="Закрыть окно"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-lg font-normal text-white/80 transition hover:bg-white/20 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mt-7 rounded-[28px] border border-[#5227FF]/25 bg-[#5227FF]/10 p-5 md:p-6">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200/60">
                Миссия
              </div>
              <p className="mt-3 max-w-4xl text-xl font-medium leading-relaxed text-white md:text-2xl">
                Развивать Якутию, создавая возможности роста в меняющемся мире.
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <AboutCard
                title="Привлечение инвестиций"
                text="Поиск инвесторов и софинансирования для проектов в приоритетных отраслях экономики региона."
              />

              <AboutCard
                title="Подготовка проектов"
                text="Экспертиза инициатив, разработка финансовых моделей и структурирование инвестиционных предложений."
              />

              <AboutCard
                title="Сопровождение"
                text="Координация проекта на всех этапах — от первоначальной идеи до запуска и дальнейшего развития."
              />
            </div>

            <div className="mt-5 grid gap-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6">
              <div>
                <div className="text-lg font-bold text-white">Навигатор проектов</div>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
                  Цифровая витрина проектов Корпорации: здесь собраны команды,
                  стадии готовности, материалы и запросы на инвестиции,
                  партнёрство или пилотный запуск.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 md:justify-end">
                <a
                  href="mailto:info@corp-sakha.ru?subject=Обращение с сайта Навигатор проектов"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 px-5 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  Связаться
                </a>
                <a
                  href="https://yakutiacorp.ru/about/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-[#5227FF] px-5 text-sm font-medium text-white transition hover:bg-indigo-500"
                >
                  Официальный сайт
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AboutCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <div className="text-sm font-black text-white">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-white/65">
        {text}
      </div>
    </div>
  );
}
