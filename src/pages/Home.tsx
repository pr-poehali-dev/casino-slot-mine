import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

const featuredGames = [
  { id: "slots", name: "Слоты", icon: "🎰", desc: "Классические однорукие бандиты", color: "from-purple-900 to-purple-700", badge: "ХИТ" },
  { id: "miner", name: "Минёр", icon: "💣", desc: "Найди бриллианты, избегая мин", color: "from-blue-900 to-blue-700", badge: "НОВИНКА" },
  { id: "crash", name: "Краш", icon: "✈️", desc: "Успей забрать выигрыш до краша!", color: "from-red-900 to-red-700", badge: "ПОПУЛЯРНО" },
];

const stats = [
  { value: "10K+", label: "Игроков" },
  { value: "3", label: "Игры" },
  { value: "24/7", label: "Онлайн" },
  { value: "∞", label: "Выигрышей" },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0d0d1a] to-[#0a0a0f] py-20 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-1.5 text-yellow-400 text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Сейчас онлайн: 234 игрока
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="text-white">KAZAH</span>
            <span className="text-yellow-400">CASINO</span>
          </h1>


          <div className="flex flex-wrap justify-center gap-4">
            {user ? (
              <Link
                to="/games"
                className="bg-yellow-500 text-black font-bold text-lg px-8 py-3 rounded-xl hover:bg-yellow-400 transition-all hover:scale-105"
              >
                🎮 Играть
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-yellow-500 text-black font-bold text-lg px-8 py-3 rounded-xl hover:bg-yellow-400 transition-all hover:scale-105"
                >
                  🚀 Начать играть
                </Link>
                <Link
                  to="/login"
                  className="border border-gray-600 text-gray-300 font-semibold text-lg px-8 py-3 rounded-xl hover:border-yellow-500 hover:text-yellow-400 transition-all"
                >
                  Войти
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-800 py-8 bg-[#0d0d1a]">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-black text-yellow-400">{s.value}</div>
              <div className="text-gray-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Games */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-2">Популярные игры</h2>
          <p className="text-gray-500">Выбери свою игру и испытай удачу</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {featuredGames.map((game) => (
            <Link
              key={game.id}
              to={`/games/${game.id}`}
              className="group relative overflow-hidden rounded-2xl border border-gray-800 hover:border-yellow-500/50 transition-all hover:scale-[1.02]"
            >
              <div className={`bg-gradient-to-br ${game.color} p-8 text-center`}>
                <div className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
                  {game.badge}
                </div>
                <div className="text-6xl mb-4">{game.icon}</div>
                <h3 className="text-2xl font-black text-white mb-2">{game.name}</h3>
                <p className="text-white/70 text-sm">{game.desc}</p>
                <div className="mt-5 inline-block bg-white/10 text-white text-sm px-4 py-2 rounded-lg group-hover:bg-yellow-500 group-hover:text-black transition-all font-semibold">
                  Играть →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bonuses promo */}
      {!user && (
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">🎁</div>

            <Link
              to="/register"
              className="bg-yellow-500 text-black font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 transition-all inline-block"
            >
              Получить бонус
            </Link>
          </div>
        </section>
      )}
    </Layout>
  );
}