import Link from 'next/link';
import Image from 'next/image';

const footerLinkClass =
  'text-sm font-normal text-white/55 transition hover:text-white';

export default function SiteFooter() {
  return (
    <footer className="relative z-10 w-full border-t border-white/10 bg-black/80 text-white backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.35fr_0.75fr_1fr_0.75fr] lg:gap-12">
          <section>
            <a
              href="https://yakutiacorp.ru/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 transition hover:opacity-85"
            >
              <Image
                src="/brand/yakutia-corp-icon.png"
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 object-contain"
              />
              <span className="max-w-64 text-sm font-bold leading-snug text-white md:text-base">
                Корпорация развития Республики Саха (Якутия)
              </span>
            </a>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">
              Создаём будущее через устойчивое развитие территорий,
              современную инфраструктуру и поддержку перспективных проектов.
            </p>

            <a
              href="mailto:info@corp-sakha.ru?subject=Заявка с сайта Навигатор проектов"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 px-5 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Оставить заявку
              <span aria-hidden className="ml-2 text-white/45">→</span>
            </a>
          </section>

          <FooterColumn title="Карта сайта">
            <Link href="/" className={footerLinkClass}>Главная</Link>
            <Link href="/#project-map" className={footerLinkClass}>Проекты</Link>
            <Link href="/investors" className={footerLinkClass}>Инвесторам</Link>
            <a href="https://yakutiacorp.ru/about/" target="_blank" rel="noreferrer" className={footerLinkClass}>О корпорации</a>
            <Link href="/admin" className={footerLinkClass}>Админка</Link>
          </FooterColumn>

          <FooterColumn title="Контакты">
            <ContactLink href="tel:+74112506295" label="Телефон">+7 (4112) 50-62-95</ContactLink>
            <ContactLink href="mailto:info@corp-sakha.ru" label="Email">info@corp-sakha.ru</ContactLink>
            <ContactLink href="https://go.2gis.com/SBUvT" label="Адрес" external>
              г. Якутск, ул. Труда, 1
            </ContactLink>
          </FooterColumn>

          <FooterColumn title="Социальные сети">
            <SocialLink href="https://vk.com/yakutiacorp" shortName="VK">ВКонтакте</SocialLink>
            <SocialLink href="https://t.me/yakutiacorp" shortName="TG">Telegram</SocialLink>
            <SocialLink href="https://max.ru/id1435289661_gos" shortName="MAX">MAX</SocialLink>
          </FooterColumn>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/35 md:flex-row md:items-center md:justify-between">
          <span>© 2026 Корпорация развития Республики Саха (Якутия)</span>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href="https://yakutiacorp.ru/agreement/" target="_blank" rel="noreferrer" className="transition hover:text-white/70">
              Пользовательское соглашение
            </a>
            <a href="https://yakutiacorp.ru/privacy-policy/" target="_blank" rel="noreferrer" className="transition hover:text-white/70">
              Политика конфиденциальности
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-sm font-bold text-white">{title}</h2>
      <div className="mt-5 flex flex-col items-start gap-3.5">{children}</div>
    </section>
  );
}

function ContactLink({
  href,
  label,
  external = false,
  children,
}: {
  href: string;
  label: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="group block text-sm"
    >
      <span className="block text-[11px] uppercase tracking-[0.14em] text-white/30">{label}</span>
      <span className="mt-1 block leading-relaxed text-white/60 transition group-hover:text-white">{children}</span>
    </a>
  );
}

function SocialLink({
  href,
  shortName,
  children,
}: {
  href: string;
  shortName: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-3 text-sm text-white/55 transition hover:text-white"
    >
      <span className="flex h-9 min-w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-2 text-[10px] font-bold text-white/75 transition group-hover:bg-white/12 group-hover:text-white">
        {shortName}
      </span>
      {children}
    </a>
  );
}
