import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

const games = [
  {
    id: "slots",
    name: "Слоты",
    icon: "🎰",
    desc: "Классические трёхбарабанные слоты. Крути и выигрывай!",
    color: "from-purple-900 to-purple-800",
    border: "border-purple-500/40",
    badge: "ХИТ",
    badgeColor: "bg-purple-500",
    minBet: 10,
    maxWin: "100x",
  },
  {
    id: "miner",
    name: "Минёр",
    icon: "💣",
    desc: "Открывай клетки с бриллиантами, избегай мины. Чем больше открытых — тем выше выигрыш!",
    color: "from-blue-900 to-blue-800",
    border: "border-blue-500/40",
    badge: "СТРАТЕГИЯ",
    badgeColor: "bg-blue-500",
    minBet: 10,
    maxWin: "25x",
  },
  {
    id: "crash",
    name: "Краш",
    icon: "✈️",
    desc: "Самолёт летит вверх — коэффициент растёт. Успей забрать до краша!",
    color: "from-red-900 to-red-800",
    border: "border-red-500/40",
    badge: "АДРЕНАЛИН",
    badgeColor: "bg-red-500",
    minBet: 10,
    maxWin: "∞",
  },
];

export default function Games() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-3">🎮 Игры</h1>
          <p className="text-gray-500">Выбери игру и испытай удачу за Казах Коины</p>
          {user && (
            <div className="mt-4 inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-2 text-yellow-400 text-sm">
              💰 Баланс: <span className="font-black">{user.balance.toFixed(0)} К</span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className={`bg-gradient-to-br ${game.color} border ${game.border} rounded-2xl overflow-hidden hover:scale-[1.02] transition-all`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">{game.icon}</div>
                  <span className={`${game.badgeColor} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
                    {game.badge}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white mb-2">{game.name}</h3>
                <p className="text-white/60 text-sm mb-5 leading-relaxed">{game.desc}</p>

                <div className="flex items-center justify-between text-xs text-white/50 mb-5">
                  <span>Мин. ставка: {game.minBet} К</span>
                  <span>Макс. выигрыш: {game.maxWin}</span>
                </div>

                <Link
                  to={`/games/${game.id}`}
                  className="block w-full text-center bg-white/10 hover:bg-yellow-500 hover:text-black text-white font-bold py-3 rounded-xl transition-all"
                >
                  Играть →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {!user && (
          <div className="mt-10 text-center bg-[#0d0d1a] border border-gray-800 rounded-2xl p-8">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-xl font-bold text-white mb-2">Войдите для игры</h3>
            <p className="text-gray-500 mb-5">Создайте аккаунт и получите стартовые монеты через промокоды</p>
            <div className="flex gap-3 justify-center">
              <Link to="/register" className="bg-yellow-500 text-black font-bold px-6 py-2.5 rounded-xl hover:bg-yellow-400 transition-all">
                Регистрация
              </Link>
              <Link to="/login" className="border border-gray-700 text-gray-300 px-6 py-2.5 rounded-xl hover:border-yellow-500 hover:text-yellow-400 transition-all">
                Войти
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
