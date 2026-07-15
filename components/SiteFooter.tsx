import Link from 'next/link';

const footerLinkClass =
  'text-sm font-normal text-white/55 transition hover:text-white';

export default function SiteFooter() {
  return (
    <footer className="relative z-10 w-full border-t border-white/10 bg-black/80 text-white backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.25fr_0.75fr_1fr_0.85fr] lg:gap-12">
          <section>
            <h2 className="max-w-72 text-base font-bold leading-snug text-white">
              Корпорация развития Республики Саха (Якутия)
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">
              Создаём будущее через устойчивое развитие территорий,
              современную инфраструктуру и поддержку перспективных проектов.
            </p>
          </section>

          <FooterColumn title="Карта сайта">
            <Link href="/" className={footerLinkClass}>Главная</Link>
            <Link href="/#project-map" className={footerLinkClass}>Проекты</Link>
            <Link href="/investors" className={footerLinkClass}>Инвесторам</Link>
            <Link href="/about" className={footerLinkClass}>О корпорации</Link>
            <Link href="/contacts" className={footerLinkClass}>Контакты</Link>
          </FooterColumn>

          <FooterColumn title="Контакты">
            <ContactLink href="tel:+74112506295" label="Телефон">+7 (4112) 50-62-95</ContactLink>
            <ContactLink href="mailto:info@corp-sakha.ru" label="Email">info@corp-sakha.ru</ContactLink>
            <ContactLink href="https://go.2gis.com/SBUvT" label="Адрес" external>
              г. Якутск, ул. Труда, 1
            </ContactLink>
          </FooterColumn>

          <FooterColumn title="Социальные сети">
            <SocialIconLink href="https://vk.com/yakutiacorp" label="ВКонтакте" icon="vk" />
            <SocialIconLink href="https://t.me/yakutiacorp" label="Telegram" icon="telegram" />
            <SocialIconLink href="https://max.ru/id1435289661_gos" label="MAX" icon="max" />
            <SocialIconLink href="https://yakutiacorp.ru/" label="Официальный сайт" icon="web" />
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
      <span className="block text-[11px] uppercase tracking-[0.14em] text-white/50">{label}</span>
      <span className="mt-1 block leading-relaxed text-white/82 transition group-hover:text-white">{children}</span>
    </a>
  );
}

function SocialIconLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: 'vk' | 'telegram' | 'max' | 'web';
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="group flex items-center gap-3 text-sm text-white/68 transition hover:text-white"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-800/85 text-white shadow-lg shadow-black/15 transition group-hover:-translate-y-0.5 group-hover:bg-slate-700">
        <SocialIcon icon={icon} />
      </span>
      <span>{label}</span>
    </a>
  );
}

function SocialIcon({ icon }: { icon: 'vk' | 'telegram' | 'max' | 'web' }) {
  if (icon === 'vk') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
        <path d="M12.7 17.2c-5.3 0-8.4-3.6-8.6-9.6h2.7c.1 4.4 2 6.3 3.4 6.7V7.6h2.6v3.8c1.4-.2 2.8-1.9 3.3-3.8h2.6c-.4 2.3-2.2 4-3.4 4.7 1.2.6 3.1 2.1 3.9 4.9h-2.9c-.5-1.8-1.8-3.2-3.5-3.5v3.5h-.1Z" />
      </svg>
    );
  }

  if (icon === 'telegram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
        <path d="M20.9 4.6 17.8 19c-.2 1-.8 1.2-1.6.8l-4.4-3.2-2.1 2c-.2.2-.4.4-.9.4l.3-4.5 8.2-7.4c.4-.3-.1-.5-.5-.2L6.6 13.3l-4.4-1.4c-1-.3-1-1 .2-1.5L19.5 3.8c.8-.3 1.5.2 1.4.8Z" />
      </svg>
    );
  }

  if (icon === 'web') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[2]">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.8 12h16.4M12 3.5c2.1 2.2 3.2 5 3.2 8.5s-1.1 6.3-3.2 8.5M12 3.5C9.9 5.7 8.8 8.5 8.8 12s1.1 6.3 3.2 8.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M6.2 6.4c1.7-1.5 3.6-2.2 5.8-2.2s4.1.7 5.8 2.2c1.6 1.5 2.5 3.3 2.5 5.4s-.8 3.9-2.5 5.4c-1.7 1.5-3.6 2.2-5.8 2.2-1.1 0-2.1-.2-3-.5l-3.4 1.4.8-3.3c-1.8-1.5-2.7-3.2-2.7-5.3 0-2 .8-3.8 2.5-5.3Zm2.3 8.3h1.9v-4.1l1.6 2.4 1.6-2.4v4.1h1.9V8.6h-1.9L12 11.2l-1.6-2.6H8.5v6.1Z" />
    </svg>
  );
}
