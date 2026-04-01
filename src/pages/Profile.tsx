import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth, API_URL } from "@/context/AuthContext";

interface Transaction {
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

export default function Profile() {
  const { user, logout, refreshProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/profile?user_id=${user.user_id}`);
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.transactions || []);
        await refreshProfile();
      }
    } finally {
      setLoading(false);
    }
  };

  const txTypeLabel = (type: string) => {
    switch (type) {
      case "game": return "🎮 Игра";
      case "transfer": return "💸 Перевод";
      case "promo": return "🎁 Промокод";
      default: return type;
    }
  };

  const txColor = (amount: number) =>
    amount >= 0 ? "text-green-400" : "text-red-400";

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-black text-white mb-4">Войдите в аккаунт</h2>
            <p className="text-gray-500 mb-6">Чтобы просматривать профиль, необходимо авторизоваться</p>
            <div className="flex gap-3 justify-center">
              <Link to="/login" className="bg-yellow-500 text-black font-bold px-6 py-2.5 rounded-xl hover:bg-yellow-400 transition-all">
                Войти
              </Link>
              <Link to="/register" className="border border-gray-700 text-gray-300 px-6 py-2.5 rounded-xl hover:border-yellow-500 hover:text-yellow-400 transition-all">
                Регистрация
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-white mb-8">Профиль</h1>

        {/* User card */}
        <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-3xl">
                👤
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user.username}</h2>
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-all"
            >
              Выйти
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-[#1a1a2e] rounded-xl p-4">
              <div className="text-gray-500 text-xs mb-1">Мой ID</div>
              <div className="text-yellow-400 font-black text-xl tracking-wider">{user.user_id}</div>
              <div className="text-gray-600 text-xs mt-1">Для получения переводов</div>
            </div>
            <div className="bg-[#1a1a2e] rounded-xl p-4">
              <div className="text-gray-500 text-xs mb-1">Баланс</div>
              <div className="text-yellow-400 font-black text-xl">{user.balance.toFixed(0)} К</div>
              <div className="text-gray-600 text-xs mt-1">Казах Коины</div>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Link to="/games" className="bg-[#0d0d1a] border border-gray-800 hover:border-purple-500/50 rounded-xl p-4 text-center transition-all">
            <div className="text-2xl mb-1">🎮</div>
            <div className="text-xs text-gray-400">Играть</div>
          </Link>
          <Link to="/transfer" className="bg-[#0d0d1a] border border-gray-800 hover:border-blue-500/50 rounded-xl p-4 text-center transition-all">
            <div className="text-2xl mb-1">💸</div>
            <div className="text-xs text-gray-400">Перевод</div>
          </Link>
          <Link to="/bonuses" className="bg-[#0d0d1a] border border-gray-800 hover:border-yellow-500/50 rounded-xl p-4 text-center transition-all">
            <div className="text-2xl mb-1">🎁</div>
            <div className="text-xs text-gray-400">Бонусы</div>
          </Link>
        </div>

        {/* Transactions */}
        <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">История операций</h3>
            <button onClick={loadProfile} className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
              {loading ? "Загрузка..." : "Обновить"}
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <div className="text-3xl mb-2">📭</div>
              Операций пока нет
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between bg-[#1a1a2e] rounded-xl px-4 py-3">
                  <div>
                    <div className="text-sm text-white font-medium">{txTypeLabel(tx.type)}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{tx.description}</div>
                    <div className="text-xs text-gray-700 mt-0.5">{new Date(tx.created_at).toLocaleString("ru")}</div>
                  </div>
                  <div className={`font-bold text-sm ${txColor(tx.amount)}`}>
                    {tx.amount >= 0 ? "+" : ""}{tx.amount.toFixed(0)} К
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
