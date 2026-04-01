import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth, API_URL } from "@/context/AuthContext";

const promoCodes = [
  { code: "KAZAH100", bonus: 100, desc: "Стартовый бонус" },
  { code: "WELCOME50", bonus: 50, desc: "Приветственный пакет" },
  { code: "LUCKY200", bonus: 200, desc: "Для счастливчиков" },
];

export default function Bonuses() {
  const { user, refreshProfile } = useAuth();
  const [promoInput, setPromoInput] = useState("");
  const [promoStatus, setPromoStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setPromoStatus(null);
    try {
      const res = await fetch(`${API_URL}/promo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id, code: promoInput.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setPromoStatus({ type: "success", msg: `✅ Промокод активирован! +${data.bonus} К на ваш счёт` });
        setPromoInput("");
        await refreshProfile();
      } else {
        setPromoStatus({ type: "error", msg: data.error || "Ошибка активации" });
      }
    } catch {
      setPromoStatus({ type: "error", msg: "Ошибка соединения" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-white mb-2">Бонусы</h1>
        <p className="text-gray-500 mb-8">Активируйте промокоды и получайте бонусные Казах Коины</p>

        {/* Balance block */}
        {user && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-5 mb-8 flex items-center gap-4">
            <div className="text-4xl">💰</div>
            <div>
              <div className="text-gray-400 text-sm">Ваш баланс</div>
              <div className="text-2xl font-black text-yellow-400">{user.balance.toFixed(0)} К</div>
            </div>
          </div>
        )}

        {/* Promo code input */}
        <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🏷️</span> Ввести промокод
          </h2>

          {!user ? (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">Для активации промокода необходимо войти в аккаунт</p>
              <div className="flex gap-3 justify-center">
                <Link to="/login" className="bg-yellow-500 text-black font-bold px-5 py-2 rounded-xl hover:bg-yellow-400 transition-all">
                  Войти
                </Link>
                <Link to="/register" className="border border-gray-700 text-gray-300 px-5 py-2 rounded-xl hover:border-yellow-500 hover:text-yellow-400 transition-all">
                  Регистрация
                </Link>
              </div>
            </div>
          ) : (
            <>
              {promoStatus && (
                <div
                  className={`rounded-lg px-4 py-3 text-sm mb-4 ${
                    promoStatus.type === "success"
                      ? "bg-green-500/10 border border-green-500/30 text-green-400"
                      : "bg-red-500/10 border border-red-500/30 text-red-400"
                  }`}
                >
                  {promoStatus.msg}
                </div>
              )}

              <form onSubmit={handlePromo} className="flex gap-3">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Введите промокод..."
                  className="flex-1 bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-colors font-mono tracking-widest"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "..." : "Применить"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Available promos */}
        <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🎁</span> Доступные промокоды
          </h2>

          <div className="space-y-3">
            {promoCodes.map((p) => (
              <div
                key={p.code}
                className="flex items-center justify-between bg-[#1a1a2e] rounded-xl px-4 py-4 border border-gray-800 hover:border-yellow-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500/10 rounded-lg p-2 text-xl">🎟️</div>
                  <div>
                    <div className="font-mono font-bold text-yellow-400 tracking-widest">{p.code}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{p.desc}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-black text-lg">+{p.bonus} К</div>
                  <button
                    onClick={() => setPromoInput(p.code)}
                    className="text-xs text-gray-500 hover:text-yellow-400 transition-colors mt-0.5"
                  >
                    Вставить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bonus coins info */}
        <div className="mt-6 bg-[#0d0d1a] border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🪙</span> Бонусные монеты
          </h2>
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex gap-3 items-start">
              <span className="text-yellow-400 font-bold text-base">•</span>
              <span>Бонусные монеты зачисляются мгновенно на ваш игровой баланс</span>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-yellow-400 font-bold text-base">•</span>
              <span>Используйте Казах Коины (К) в любых играх казино</span>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-yellow-400 font-bold text-base">•</span>
              <span>Каждый промокод можно использовать только один раз на аккаунт</span>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-yellow-400 font-bold text-base">•</span>
              <span>Переводите К другим игрокам по их ID в разделе Переводы</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
