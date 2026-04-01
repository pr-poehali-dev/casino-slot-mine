import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "⭐", "7️⃣", "💎"];
const WEIGHTS = [30, 25, 20, 15, 6, 3, 1];

function weightedRandom() {
  const total = WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < WEIGHTS.length; i++) {
    if (r < WEIGHTS[i]) return SYMBOLS[i];
    r -= WEIGHTS[i];
  }
  return SYMBOLS[0];
}

const PAYOUTS: Record<string, number> = {
  "🍒": 2,
  "🍋": 3,
  "🍊": 4,
  "🍇": 5,
  "⭐": 10,
  "7️⃣": 20,
  "💎": 100,
};

const SYMBOL_LABELS: Record<string, string> = {
  "🍒": "x2",
  "🍋": "x3",
  "🍊": "x4",
  "🍇": "x5",
  "⭐": "x10",
  "7️⃣": "x20",
  "💎": "x100",
};

function calcWin(reels: string[], bet: number): { win: number; line: string } {
  const [a, b, c] = reels;
  if (a === b && b === c) return { win: bet * PAYOUTS[a], line: `3x ${a}` };
  if (a === b || b === c) {
    const sym = a === b ? a : b;
    return { win: bet * Math.floor(PAYOUTS[sym] / 2), line: `2x ${sym}` };
  }
  if (a === "7️⃣" || b === "7️⃣" || c === "7️⃣") return { win: bet, line: "Джекер 7️⃣" };
  return { win: 0, line: "" };
}

export default function Slots() {
  const { user, updateBalance } = useAuth();
  const [reels, setReels] = useState(["🍒", "🍒", "🍒"]);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(10);
  const [lastResult, setLastResult] = useState<{ win: number; line: string } | null>(null);
  const [msg, setMsg] = useState("");
  const intervalRefs = useRef<ReturnType<typeof setInterval>[]>([]);

  const spin = async () => {
    if (!user || spinning) return;
    if (user.balance < bet) {
      setMsg("Недостаточно средств!");
      return;
    }
    setSpinning(true);
    setLastResult(null);
    setMsg("");

    try {
      await updateBalance(-bet, "game", `Слоты — ставка ${bet} К`);
    } catch {
      setMsg("Ошибка списания");
      setSpinning(false);
      return;
    }

    // Animate reels
    const finalReels = [weightedRandom(), weightedRandom(), weightedRandom()];
    const tempReels = [...reels];
    const stopTimes = [800, 1200, 1600];

    const animIntervals = [0, 1, 2].map((i) => {
      return setInterval(() => {
        tempReels[i] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        setReels([...tempReels]);
      }, 80);
    });

    intervalRefs.current = animIntervals;

    stopTimes.forEach((t, i) => {
      setTimeout(() => {
        clearInterval(animIntervals[i]);
        tempReels[i] = finalReels[i];
        setReels([...tempReels]);

        if (i === 2) {
          const { win, line } = calcWin(finalReels, bet);
          setLastResult({ win, line });
          if (win > 0) {
            updateBalance(win, "game", `Слоты — выигрыш ${win} К (${line})`);
            setMsg(`🎉 ВЫИГРЫШ: +${win} К! ${line}`);
          } else {
            setMsg("Не повезло... Попробуй ещё!");
          }
          setSpinning(false);
        }
      }, t);
    });
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/games" className="text-gray-500 hover:text-yellow-400 transition-colors text-sm">← Игры</Link>
        </div>

        <h1 className="text-3xl font-black text-white mb-2 text-center">🎰 Слоты</h1>
        <p className="text-gray-500 text-center text-sm mb-8">Три одинаковых символа — большой выигрыш!</p>

        {!user ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Войдите для игры</p>
            <Link to="/login" className="bg-yellow-500 text-black font-bold px-6 py-2.5 rounded-xl hover:bg-yellow-400">Войти</Link>
          </div>
        ) : (
          <>
            {/* Machine */}
            <div className="bg-gradient-to-b from-[#1a0a2e] to-[#0d0d1a] border-2 border-purple-500/50 rounded-3xl p-8 mb-6 shadow-2xl shadow-purple-500/10">
              {/* Screen */}
              <div className="bg-[#0a0a12] border-2 border-purple-700/50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-center gap-4">
                  {reels.map((sym, i) => (
                    <div
                      key={i}
                      className={`w-20 h-20 bg-gradient-to-b from-[#1a1a2e] to-[#0d0d1a] border-2 ${
                        spinning ? "border-yellow-500/80 animate-pulse" : "border-purple-700/50"
                      } rounded-xl flex items-center justify-center text-4xl shadow-inner`}
                    >
                      {sym}
                    </div>
                  ))}
                </div>

                {lastResult && !spinning && (
                  <div className={`mt-4 text-center text-sm font-bold ${lastResult.win > 0 ? "text-green-400" : "text-gray-600"}`}>
                    {lastResult.win > 0 ? `🏆 ${lastResult.line}` : "💨 Нет выигрыша"}
                  </div>
                )}
              </div>

              {/* Bet */}
              <div className="mb-4">
                <div className="text-gray-400 text-xs mb-2 text-center">Ставка (К)</div>
                <div className="flex items-center gap-2 justify-center">
                  <button
                    onClick={() => setBet(Math.max(10, bet - 10))}
                    disabled={spinning}
                    className="w-10 h-10 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white hover:border-yellow-500 transition-all text-lg"
                  >
                    −
                  </button>
                  <div className="w-24 text-center">
                    <input
                      type="number"
                      value={bet}
                      onChange={(e) => setBet(Math.max(10, Math.min(user.balance, parseInt(e.target.value) || 10)))}
                      disabled={spinning}
                      className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-2 py-2 text-white text-center font-bold focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <button
                    onClick={() => setBet(Math.min(user.balance, bet + 10))}
                    disabled={spinning}
                    className="w-10 h-10 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white hover:border-yellow-500 transition-all text-lg"
                  >
                    +
                  </button>
                </div>
                <div className="flex gap-2 justify-center mt-2">
                  {[10, 50, 100, 500].map((v) => (
                    <button
                      key={v}
                      onClick={() => setBet(Math.min(user.balance, v))}
                      disabled={spinning}
                      className="text-xs border border-gray-700 text-gray-500 hover:border-yellow-500 hover:text-yellow-400 px-2.5 py-1 rounded-lg transition-all"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spin button */}
              <button
                onClick={spin}
                disabled={spinning || !user || user.balance < bet}
                className={`w-full py-4 rounded-2xl font-black text-xl transition-all ${
                  spinning
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400 hover:scale-[1.02] shadow-lg shadow-yellow-500/20"
                }`}
              >
                {spinning ? "🎰 Кручу..." : "🎰 КРУТИТЬ"}
              </button>
            </div>

            {/* Message */}
            {msg && (
              <div className={`text-center py-3 rounded-xl font-bold text-sm mb-4 ${
                msg.includes("ВЫИГРЫШ") ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}>
                {msg}
              </div>
            )}

            {/* Balance */}
            <div className="text-center text-gray-600 text-sm">
              Баланс: <span className="text-yellow-400 font-bold">{user.balance.toFixed(0)} К</span>
            </div>

            {/* Paytable */}
            <div className="mt-8 bg-[#0d0d1a] border border-gray-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-gray-400 mb-3">Таблица выплат</h3>
              <div className="grid grid-cols-2 gap-2">
                {SYMBOLS.map((sym) => (
                  <div key={sym} className="flex items-center justify-between bg-[#1a1a2e] rounded-lg px-3 py-2">
                    <span className="text-lg">{sym} {sym} {sym}</span>
                    <span className="text-yellow-400 font-bold text-sm">{SYMBOL_LABELS[sym]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-600">2 одинаковых: половина выплаты</div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
