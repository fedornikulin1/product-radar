'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch('/api/admin/me', { cache: 'no-store' });
        const data = await res.json();

        setIsAdmin(Boolean(data?.isAdmin));
      } catch {
        setIsAdmin(false);
      }
    }

    checkAdmin();
  }, [pathname]);

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

  const navItemClass =
    'inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap px-3 !text-base !font-normal !text-white/60 transition hover:!text-white';

  return (
    <header className="sticky top-4 z-[220] px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[28px] border border-white/10 bg-[#061728]/88 px-4 py-3 text-white shadow-2xl shadow-black/20 backdrop-blur-2xl md:px-6">
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

              <Link href="/investors" className={navItemClass}>
                Инвесторам
              </Link>

              <Link href="/about" className={navItemClass}>
                О нас
              </Link>

              <Link href="/contacts" className={navItemClass}>
                Контакты
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  title="Админка"
                  aria-label="Открыть админку"
                  className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#5227FF]/35 bg-[#5227FF]/25 text-sm font-black text-white shadow-lg shadow-[#5227FF]/10 transition hover:-translate-y-0.5 hover:bg-[#5227FF]/45"
                >
                  A
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
