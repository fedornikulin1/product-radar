import Link from 'next/link';
import ColorBendsBackground from '@/components/effects/ColorBendsBackground';

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-white md:px-8 md:py-12">
      <ColorBendsBackground />

      <section className="relative z-10 mx-auto max-w-7xl">
        <div className="rounded-[34px] border border-white/10 bg-black/35 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-10">
          <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/55">
            О корпорации
          </div>

          <h1 className="mt-5 max-w-5xl text-4xl font-black tracking-tight md:text-6xl">
            Корпорация развития Республики Саха (Якутия)
          </h1>

          <p className="mt-5 max-w-4xl text-lg leading-relaxed text-white/70 md:text-xl">
            Корпорация развития сопровождает инвестиционные и инфраструктурные
            инициативы в приоритетных отраслях экономики Якутии. Она работает как
            единое окно для инвесторов и инициаторов проектов, помогая выстроить
            взаимодействие между бизнесом, органами власти и институтами развития.
          </p>

          <div className="mt-8 rounded-[28px] border border-[#5227FF]/25 bg-[#5227FF]/10 p-5 md:p-6">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200/70">
              Миссия
            </div>
            <p className="mt-3 max-w-4xl text-xl font-medium leading-relaxed md:text-2xl">
              Развивать Якутию, создавая возможности роста в меняющемся мире.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <AboutCard
              title="Привлечение инвестиций"
              text="Поиск инвесторов, партнёров и инструментов поддержки, а также структурирование сделок и привлечение софинансирования."
            />
            <AboutCard
              title="Подготовка проектов"
              text="Экспертиза инициатив, упаковка материалов, формирование финансовых моделей и подготовка понятных инвестиционных предложений."
            />
            <AboutCard
              title="Сопровождение"
              text="Координация проекта на всех этапах — от идеи и пилота до реализации, масштабирования и дальнейшего развития."
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <InfoPanel
              title="Прозрачность и снижение рисков"
              text="В работе с проектами особое внимание уделяется качеству данных, понятной структуре сделки, проверке инициатив и долгосрочной устойчивости."
            />
            <InfoPanel
              title="Для чего нужен навигатор"
              text="Навигатор помогает быстро видеть статус проекта, команду, материалы, инвестиционный запрос и потребности в партнёрстве без лишней переписки."
            />
          </div>

          <div className="mt-6 grid gap-4 rounded-[28px] border border-white/10 bg-black/30 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6">
            <div>
              <div className="text-lg font-bold">Навигатор проектов</div>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">
                Цифровая витрина проектов Корпорации: здесь собраны команды,
                материалы, инвестиционные запросы и потребности в партнёрстве.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                href="/contacts"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 px-5 text-sm font-medium transition hover:bg-white/15"
              >
                Связаться
              </Link>
              <a
                href="https://yakutiacorp.ru/about/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#5227FF] px-5 text-sm font-medium transition hover:bg-indigo-500"
              >
                Официальный сайт
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
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
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="text-sm font-black">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-white/65">{text}</div>
    </div>
  );
}

function InfoPanel({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5">
      <div className="text-base font-black">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-white/65 md:text-base">
        {text}
      </p>
    </div>
  );
}
