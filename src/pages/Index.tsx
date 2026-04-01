import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const useInView = (threshold = 0.15) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
};

const services = [
  {
    icon: "Layers",
    title: "Стратегия",
    desc: "Глубокий анализ рынка и конкурентов. Выстраиваем чёткий путь от идеи до результата.",
  },
  {
    icon: "Paintbrush",
    title: "Дизайн",
    desc: "Визуальные решения, которые вызывают доверие и запоминаются надолго.",
  },
  {
    icon: "Code2",
    title: "Разработка",
    desc: "Быстрые, надёжные продукты. Современный стек, чистый код, без лишнего.",
  },
  {
    icon: "TrendingUp",
    title: "Рост",
    desc: "Запуск, аналитика, итерации. Помогаем расти после старта.",
  },
];

const cases = [
  { num: "01", title: "Флагманский интернет-магазин", tag: "E-commerce", result: "+340% конверсия" },
  { num: "02", title: "Платформа онлайн-обучения", tag: "EdTech", result: "12 000 пользователей" },
  { num: "03", title: "Брендинг для стартапа", tag: "Identity", result: "Seed-раунд $1.2M" },
];

const stats = [
  { value: "7+", label: "лет опыта" },
  { value: "120", label: "проектов" },
  { value: "98%", label: "клиентов довольны" },
  { value: "48ч", label: "первый прототип" },
];

function AnimSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="font-body bg-[#0D0D0D] text-[#F0EDE6] min-h-screen overflow-x-hidden">
      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />

      {/* Nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled ? "bg-[#0D0D0D]/90 backdrop-blur-md border-b border-white/5" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
          <a href="#" className="font-display text-xl md:text-2xl tracking-widest text-[#C9A84C] font-light">
            STUDIO
          </a>
          <div className="hidden md:flex items-center gap-10">
            {["Услуги", "Работы", "О нас", "Контакт"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm tracking-wider text-[#F0EDE6]/60 hover:text-[#C9A84C] transition-colors duration-300"
              >
                {item}
              </a>
            ))}
          </div>
          <button
            className="hidden md:flex items-center gap-2 border border-[#C9A84C]/40 text-[#C9A84C] text-sm tracking-widest px-5 py-2 hover:bg-[#C9A84C] hover:text-[#0D0D0D] transition-all duration-300"
            onClick={() => {}}
          >
            Связаться
          </button>
          <button
            className="md:hidden text-[#F0EDE6] p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name={menuOpen ? "X" : "Menu"} size={22} />
          </button>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0D0D0D] border-t border-white/5 px-6 py-6 flex flex-col gap-5">
            {["Услуги", "Работы", "О нас", "Контакт"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-base tracking-wider text-[#F0EDE6]/70 hover:text-[#C9A84C] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-10 max-w-7xl mx-auto pt-20">
        {/* Background decoration */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-[#C9A84C]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-0 w-[300px] h-[300px] rounded-full bg-[#C9A84C]/3 blur-[80px] pointer-events-none" />

        <div className="relative">
          {/* Overline */}
          <div
            className="flex items-center gap-3 mb-8"
            style={{ animation: "fade-in 0.6s ease-out forwards", opacity: 0 }}
          >
            <div className="h-px w-10 bg-[#C9A84C]" />
            <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase font-body">
              Дизайн & Разработка
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-display font-light leading-[1.05] tracking-tight"
            style={{ animation: "fade-in 0.8s ease-out 0.15s forwards", opacity: 0 }}
          >
            <span className="block text-[clamp(3rem,8vw,7rem)] text-[#F0EDE6]">
              Создаём
            </span>
            <span className="block text-[clamp(3rem,8vw,7rem)] text-[#C9A84C] italic">
              продукты,
            </span>
            <span className="block text-[clamp(3rem,8vw,7rem)] text-[#F0EDE6]">
              которые работают.
            </span>
          </h1>

          {/* Sub */}
          <p
            className="mt-8 max-w-lg text-[#F0EDE6]/50 text-lg leading-relaxed font-body"
            style={{ animation: "fade-in 0.8s ease-out 0.35s forwards", opacity: 0 }}
          >
            От стратегии до запуска — полный цикл создания цифровых продуктов
            для амбициозных команд.
          </p>

          {/* CTA */}
          <div
            className="mt-12 flex flex-wrap items-center gap-4"
            style={{ animation: "fade-in 0.8s ease-out 0.5s forwards", opacity: 0 }}
          >
            <button className="group flex items-center gap-3 bg-[#C9A84C] text-[#0D0D0D] font-body font-600 text-sm tracking-widest uppercase px-8 py-4 hover:bg-[#F5E6C8] transition-all duration-300">
              Начать проект
              <Icon name="ArrowRight" size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button className="text-[#F0EDE6]/50 text-sm tracking-widest uppercase px-8 py-4 border border-white/10 hover:border-white/30 hover:text-[#F0EDE6] transition-all duration-300">
              Наши работы
            </button>
          </div>

          {/* Scroll hint */}
          <div
            className="absolute bottom-8 right-0 hidden lg:flex flex-col items-center gap-2"
            style={{ animation: "fade-in 1s ease-out 1s forwards", opacity: 0 }}
          >
            <span className="text-[#F0EDE6]/30 text-xs tracking-[0.25em] uppercase rotate-90 origin-center translate-x-6">
              Листать
            </span>
            <div className="w-px h-12 bg-gradient-to-b from-[#C9A84C]/40 to-transparent" />
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="mt-20 pt-10 border-t border-white/8 grid grid-cols-2 md:grid-cols-4 gap-8"
          style={{ animation: "fade-in 0.8s ease-out 0.7s forwards", opacity: 0 }}
        >
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-display text-[2.5rem] font-light text-[#C9A84C] leading-none">
                {s.value}
              </div>
              <div className="text-[#F0EDE6]/40 text-xs tracking-wider mt-1 uppercase">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-32 px-6 md:px-10 max-w-7xl mx-auto">
        <AnimSection className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-[#C9A84C]" />
            <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase">Услуги</span>
          </div>
          <h2 className="font-display font-light text-[clamp(2rem,5vw,3.5rem)] text-[#F0EDE6] leading-tight">
            Что мы умеем<br />
            <span className="italic text-[#C9A84C]">лучше всего</span>
          </h2>
        </AnimSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
          {services.map((s, i) => (
            <AnimSection key={s.title} delay={i * 0.1}>
              <div className="group bg-[#0D0D0D] p-8 h-full hover:bg-[#141414] transition-colors duration-300 cursor-pointer">
                <div className="w-10 h-10 mb-6 flex items-center justify-center border border-[#C9A84C]/30 group-hover:border-[#C9A84C] group-hover:bg-[#C9A84C]/10 transition-all duration-300">
                  <Icon name={s.icon} fallback="Star" size={18} className="text-[#C9A84C]" />
                </div>
                <h3 className="font-display text-xl font-light text-[#F0EDE6] mb-3 tracking-wide">
                  {s.title}
                </h3>
                <p className="text-[#F0EDE6]/40 text-sm leading-relaxed">{s.desc}</p>
                <div className="mt-6 flex items-center gap-2 text-[#C9A84C]/0 group-hover:text-[#C9A84C] transition-all duration-300 text-xs tracking-widest uppercase">
                  <span>Подробнее</span>
                  <Icon name="ArrowRight" size={12} />
                </div>
              </div>
            </AnimSection>
          ))}
        </div>
      </section>

      {/* Cases */}
      <section className="py-32 px-6 md:px-10 max-w-7xl mx-auto">
        <AnimSection className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase">Кейсы</span>
            </div>
            <h2 className="font-display font-light text-[clamp(2rem,5vw,3.5rem)] text-[#F0EDE6] leading-tight">
              Избранные<br />
              <span className="italic text-[#C9A84C]">работы</span>
            </h2>
          </div>
          <button className="self-start md:self-auto text-[#F0EDE6]/50 text-xs tracking-[0.25em] uppercase hover:text-[#C9A84C] transition-colors duration-300 flex items-center gap-2">
            Все кейсы <Icon name="ArrowRight" size={12} />
          </button>
        </AnimSection>

        <div className="space-y-px">
          {cases.map((c, i) => (
            <AnimSection key={c.num} delay={i * 0.12}>
              <div className="group bg-[#0D0D0D] hover:bg-[#141414] transition-colors duration-300 p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10 cursor-pointer border-b border-white/5">
                <span className="font-display text-5xl font-light text-[#C9A84C]/20 group-hover:text-[#C9A84C]/40 transition-colors duration-300 leading-none">
                  {c.num}
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-2xl md:text-3xl font-light text-[#F0EDE6] leading-tight">
                    {c.title}
                  </h3>
                  <span className="text-[#C9A84C]/60 text-xs tracking-[0.2em] uppercase mt-1 block">
                    {c.tag}
                  </span>
                </div>
                <div className="md:text-right">
                  <span className="text-[#F0EDE6]/60 text-sm">{c.result}</span>
                </div>
                <Icon
                  name="ArrowUpRight"
                  size={20}
                  className="text-[#C9A84C]/0 group-hover:text-[#C9A84C] transition-all duration-300 shrink-0"
                />
              </div>
            </AnimSection>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-32 px-6 md:px-10 max-w-7xl mx-auto">
        <AnimSection>
          <div className="relative border border-[#C9A84C]/20 p-12 md:p-20 overflow-hidden">
            {/* bg glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-[#C9A84C]/20 via-transparent to-transparent pointer-events-none" />

            <div className="relative text-center">
              <span className="text-[#C9A84C] text-xs tracking-[0.35em] uppercase">
                Готовы начать?
              </span>
              <h2 className="font-display font-light text-[clamp(2.5rem,6vw,5rem)] text-[#F0EDE6] leading-tight mt-4 mb-8">
                Ваш проект —<br />
                <span className="italic text-[#C9A84C]">наш следующий шедевр</span>
              </h2>
              <p className="text-[#F0EDE6]/40 max-w-md mx-auto mb-10 leading-relaxed">
                Расскажите о задаче — ответим в течение 24 часов и предложим
                первые решения бесплатно.
              </p>
              <button className="group inline-flex items-center gap-3 bg-[#C9A84C] text-[#0D0D0D] font-body text-sm tracking-widest uppercase px-10 py-5 hover:bg-[#F5E6C8] transition-all duration-300">
                Написать нам
                <Icon name="ArrowRight" size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </AnimSection>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 md:px-10 py-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <span className="font-display text-xl tracking-widest text-[#C9A84C] font-light">
            STUDIO
          </span>
          <div className="flex flex-wrap gap-6">
            {["Instagram", "Telegram", "Behance", "LinkedIn"].map((s) => (
              <a
                key={s}
                href="#"
                className="text-[#F0EDE6]/30 text-xs tracking-wider hover:text-[#C9A84C] transition-colors duration-300 uppercase"
              >
                {s}
              </a>
            ))}
          </div>
          <span className="text-[#F0EDE6]/20 text-xs">
            © 2025 Studio. Все права защищены.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;