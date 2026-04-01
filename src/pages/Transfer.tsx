import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth, API_URL } from "@/context/AuthContext";

export default function Transfer() {
  const { user, refreshProfile } = useAuth();
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");
  const [lookupResult, setLookupResult] = useState<{ user_id: string; username: string } | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLooking, setIsLooking] = useState(false);

  const lookupUser = async () => {
    if (!toId.trim()) return;
    setIsLooking(true);
    setLookupResult(null);
    setLookupError("");
    try {
      const res = await fetch(`${API_URL}/user_lookup?user_id=${toId.trim().toUpperCase()}`);
      const data = await res.json();
      if (res.ok) {
        setLookupResult(data);
      } else {
        setLookupError(data.error || "Пользователь не найден");
      }
    } catch {
      setLookupError("Ошибка соединения");
    } finally {
      setIsLooking(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !lookupResult) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setStatus({ type: "error", msg: "Введите корректную сумму" });
      return;
    }
    if (amt > user.balance) {
      setStatus({ type: "error", msg: "Недостаточно средств" });
      return;
    }
    setIsLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_URL}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_user_id: user.user_id,
          to_user_id: lookupResult.user_id,
          amount: amt,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: "success", msg: `✅ Переведено ${amt} К игроку ${lookupResult.username}` });
        setAmount("");
        setToId("");
        setLookupResult(null);
        await refreshProfile();
      } else {
        setStatus({ type: "error", msg: data.error || "Ошибка перевода" });
      }
    } catch {
      setStatus({ type: "error", msg: "Ошибка соединения" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-black text-white mb-4">Войдите в аккаунт</h2>
            <p className="text-gray-500 mb-6">Для переводов необходима авторизация</p>
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
      <div className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-white mb-2">Переводы</h1>
        <p className="text-gray-500 mb-8">Переводите Казах Коины другим игрокам по их ID</p>

        {/* My info */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-sm">Ваш ID</div>
            <div className="text-yellow-400 font-black text-xl tracking-wider">{user.user_id}</div>
          </div>
          <div className="text-right">
            <div className="text-gray-400 text-sm">Баланс</div>
            <div className="text-yellow-400 font-black text-xl">{user.balance.toFixed(0)} К</div>
          </div>
        </div>

        {status && (
          <div
            className={`rounded-xl px-4 py-3 text-sm mb-6 ${
              status.type === "success"
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            {status.msg}
          </div>
        )}

        <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <span>💸</span> Отправить К
          </h2>

          {/* Step 1: find user */}
          <div className="mb-5">
            <label className="text-gray-400 text-sm mb-1.5 block">ID получателя</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={toId}
                onChange={(e) => {
                  setToId(e.target.value.toUpperCase());
                  setLookupResult(null);
                  setLookupError("");
                }}
                placeholder="Например: KC1A2B3C"
                className="flex-1 bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-colors font-mono tracking-widest"
                maxLength={8}
              />
              <button
                type="button"
                onClick={lookupUser}
                disabled={isLooking || !toId.trim()}
                className="bg-blue-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50"
              >
                {isLooking ? "..." : "Найти"}
              </button>
            </div>

            {lookupError && (
              <div className="mt-2 text-red-400 text-sm">{lookupError}</div>
            )}

            {lookupResult && (
              <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="text-2xl">👤</div>
                <div>
                  <div className="text-green-400 font-bold">{lookupResult.username}</div>
                  <div className="text-gray-500 text-xs">ID: {lookupResult.user_id}</div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: amount */}
          {lookupResult && (
            <form onSubmit={handleTransfer}>
              <div className="mb-5">
                <label className="text-gray-400 text-sm mb-1.5 block">
                  Сумма (доступно: {user.balance.toFixed(0)} К)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                  max={user.balance}
                  step="1"
                  className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-colors text-lg font-bold"
                  required
                />
                <div className="flex gap-2 mt-2">
                  {[100, 500, 1000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAmount(String(Math.min(v, user.balance)))}
                      className="text-xs border border-gray-700 text-gray-400 hover:border-yellow-500 hover:text-yellow-400 px-3 py-1 rounded-lg transition-all"
                    >
                      {v} К
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAmount(String(user.balance))}
                    className="text-xs border border-gray-700 text-gray-400 hover:border-yellow-500 hover:text-yellow-400 px-3 py-1 rounded-lg transition-all"
                  >
                    Всё
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !amount}
                className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50"
              >
                {isLoading ? "Отправка..." : `Перевести ${amount || "0"} К → ${lookupResult.username}`}
              </button>
            </form>
          )}

          {!lookupResult && !lookupError && (
            <div className="text-center py-4 text-gray-600 text-sm">
              Введите ID игрока и нажмите «Найти» для продолжения
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 bg-[#0d0d1a] border border-gray-800 rounded-xl p-4 text-sm text-gray-500">
          <div className="flex gap-2">
            <span>ℹ️</span>
            <span>ID игрока можно найти в его профиле. Формат: KC + 6 символов. Переводы мгновенны и необратимы.</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
