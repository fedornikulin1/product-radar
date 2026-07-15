import ColorBendsBackground from '@/components/effects/ColorBendsBackground';

export default function ContactsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-white md:px-8 md:py-12">
      <ColorBendsBackground />

      <section className="relative z-10 mx-auto max-w-7xl">
        <div className="rounded-[34px] border border-white/10 bg-black/35 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-10">
          <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/55">
            Контакты
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
            Связаться с корпорацией
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/70">
            По вопросам проектов, инвестиций, партнёрств и размещения инициатив
            в навигаторе можно написать на почту, позвонить или перейти на
            официальный сайт.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <ContactCard title="Телефон" href="tel:+74112506295" value="+7 (4112) 50-62-95" />
            <ContactCard title="Email" href="mailto:info@corp-sakha.ru" value="info@corp-sakha.ru" />
            <ContactCard title="Адрес" href="https://go.2gis.com/SBUvT" value="г. Якутск, ул. Труда, 1" external />
            <ContactCard title="Официальный сайт" href="https://yakutiacorp.ru/" value="yakutiacorp.ru" external />
          </div>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-black/30 p-5 md:p-6">
            <div className="text-lg font-bold">Социальные сети</div>
            <div className="mt-4 flex flex-wrap gap-3">
              <SocialButton href="https://vk.com/yakutiacorp" label="ВКонтакте" />
              <SocialButton href="https://t.me/yakutiacorp" label="Telegram" />
              <SocialButton href="https://max.ru/id1435289661_gos" label="MAX" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ContactCard({
  title,
  value,
  href,
  external = false,
}: {
  title: string;
  value: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.1]"
    >
      <div className="text-xs font-black uppercase tracking-[0.18em] text-white/50">
        {title}
      </div>
      <div className="mt-2 text-lg font-bold text-white/90">{value}</div>
    </a>
  );
}

function SocialButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 px-5 text-sm font-bold text-white/85 transition hover:bg-white/15 hover:text-white"
    >
      {label}
    </a>
  );
}
