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

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="grid gap-4 md:grid-cols-2">
              <ContactCard title="Телефон" href="tel:+74112506295" value="+7 (4112) 50-62-95" />
              <ContactCard title="Email" href="mailto:info@corp-sakha.ru" value="info@corp-sakha.ru" />
              <ContactCard title="Адрес" href="https://yandex.ru/maps/?text=Якутск%2C%20улица%20Труда%2C%201" value="г. Якутск, ул. Труда, 1, 5 этаж, 723 кабинет" external />
              <ContactCard title="Официальный сайт" href="https://yakutiacorp.ru/" value="yakutiacorp.ru" external />
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/30 p-5 md:p-6">
              <div className="text-lg font-bold">Социальные сети</div>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Быстрые каналы для новостей, объявлений и связи с корпорацией.
              </p>
              <div className="mt-5 flex flex-col gap-2.5">
                <SocialButton href="https://vk.com/yakutiacorp" label="ВКонтакте" icon="vk" />
                <SocialButton href="https://t.me/yakutiacorp" label="Telegram" icon="telegram" />
                <SocialButton href="https://max.ru/id1435289661_gos" label="MAX" icon="max" />
              </div>
            </div>
          </div>

          <section className="mt-6 overflow-hidden rounded-[30px] border border-white/10 bg-black/25 shadow-2xl shadow-black/15">
            <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
              <div className="relative min-h-[360px] bg-slate-900/40">
                <iframe
                  title="Карта расположения Корпорации развития Республики Саха (Якутия)"
                  src="https://yandex.ru/map-widget/v1/?text=Якутск%2C%20улица%20Труда%2C%201&z=17"
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="flex flex-col justify-between gap-5 p-5 md:p-6">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
                    Где находимся
                  </div>
                  <h2 className="mt-3 text-2xl font-black text-white">
                    Офис в Якутске
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">
                    Республика Саха (Якутия), г. Якутск, улица Труда, 1.
                    Ориентир — центр города, рядом со Столичным корпусом.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-white/45">
                    Режим работы
                  </div>
                  <div className="mt-2 text-lg font-bold text-white/90">
                    с 09:00 до 18:00
                  </div>
                </div>

                <a
                  href="https://yandex.ru/maps/?text=Якутск%2C%20улица%20Труда%2C%201"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#5227FF] px-5 text-sm font-black text-white transition hover:bg-indigo-500"
                >
                  Открыть в Яндекс Картах
                </a>
              </div>
            </div>
          </section>
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
  icon,
}: {
  href: string;
  label: string;
  icon: 'vk' | 'telegram' | 'max';
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] px-3 text-sm font-bold text-white/85 transition hover:bg-white/[0.12] hover:text-white"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900/70 text-white transition group-hover:bg-slate-800">
        <SocialIcon icon={icon} />
      </span>
      <span>{label}</span>
    </a>
  );
}

function SocialIcon({ icon }: { icon: 'vk' | 'telegram' | 'max' }) {
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

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path
        fillRule="evenodd"
        d="M12.1 5.2c-4 0-7.1 2.9-7.1 6.7v6.3l3.1-2.1c1.1.7 2.5 1.1 4 1.1 4 0 7.1-2.9 7.1-6s-3.1-6-7.1-6Zm0 3.7c1.7 0 3 1.2 3 2.8s-1.3 2.8-3 2.8-3-1.2-3-2.8 1.3-2.8 3-2.8Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
