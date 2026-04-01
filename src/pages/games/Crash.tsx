import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

type GamePhase = "waiting" | "flying" | "crashed" | "cashed_out";

interface HistoryItem {
  mult: number;
  won: boolean;
  profit: number;
}

function generateCrashPoint(): number {
  // House edge ~3%
  const r = Math.random();
  if (r < 0.01) return 1.0; // instant crash 1%
  return Math.max(1.0, parseFloat((0.97 / (1 - r)).toFixed(2)));
}

export default function Crash() {
  const { user, updateBalance } = useAuth();
  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [bet, setBet] = useState(10);
  const [autoCashout, setAutoCashout] = useState<number | string>("");
  const [cashedAt, setCashedAt] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [hasBet, setHasBet] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(1);
  const betRef = useRef<number>(10);
  const autoCashoutRef = useRef<number>(0);
  const phasePendingRef = useRef(false);

  const stopGame = useCallback((crashed: boolean, multAtStop: number) => {
    cancelAnimationFrame(rafRef.current);
    const roundedMult = parseFloat(multAtStop.toFixed(2));

    if (crashed) {
      setPhase("crashed");
      setMultiplier(roundedMult);
      setMsg(hasBet ? `💥 Краш x${roundedMult}! Потерял ${betRef.current} К` : `💥 Краш x${roundedMult}`);
      if (hasBet) {
        setHistory((h) => [{ mult: roundedMult, won: false, profit: -betRef.current }, ...h].slice(0, 10));
      }
    }
  }, [hasBet]);

  const cashOut = useCallback(async (mult: number) => {
    if (phase !== "flying" || !hasBet || phasePendingRef.current) return;
    phasePendingRef.current = true;
    const win = parseFloat((betRef.current * mult).toFixed(2));
    cancelAnimationFrame(rafRef.current);
    setPhase("cashed_out");
    setCashedAt(mult);
    setMsg(`✅ Забрал x${mult.toFixed(2)}! +${win} К`);
    setHistory((h) => [{ mult, won: true, profit: win - betRef.current }, ...h].slice(0, 10));
    try {
      await updateBalance(win, "game", `Краш — забрал x${mult.toFixed(2)}, +${win} К`);
    } catch {
      // balance update error, but game continues
    }
  }, [phase, hasBet, updateBalance]);

  const tick = useCallback((now: number) => {
    const elapsed = (now - startTimeRef.current) / 1000;
    // Exponential growth: mult = e^(0.06 * elapsed)
    const newMult = Math.exp(0.06 * elapsed);
    const roundedMult = parseFloat(newMult.toFixed(2));
    setMultiplier(roundedMult);

    // Auto cashout
    if (autoCashoutRef.current > 1 && newMult >= autoCashoutRef.current && hasBet) {
      cashOut(autoCashoutRef.current);
      return;
    }

    if (newMult >= crashPointRef.current) {
      stopGame(true, crashPointRef.current);
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [hasBet, cashOut, stopGame]);

  const startRound = useCallback(async () => {
    if (phase === "flying") return;
    phasePendingRef.current = false;

    const cp = generateCrashPoint();
    setCrashPoint(cp);
    crashPointRef.current = cp;
    betRef.current = bet;
    autoCashoutRef.current = parseFloat(String(autoCashout)) || 0;

    setCashedAt(null);
    setMsg("");

    if (hasBet) {
      try {
        await updateBalance(-bet, "game", `Краш — ставка ${bet} К`);
      } catch {
        setMsg("Ошибка списания ставки");
        setHasBet(false);
        return;
      }
    }

    setPhase("flying");
    setMultiplier(1.0);
    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [phase, bet, autoCashout, hasBet, tick, updateBalance]);

  // Auto-restart countdown after crash
  useEffect(() => {
    if (phase === "crashed" || phase === "cashed_out") {
      let c = 3;
      setCountdown(c);
      const id = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(id);
          setCountdown(0);
        }
      }, 1000);
      const startId = setTimeout(() => {
        setHasBet(false);
        startRound();
      }, 3000);
      return () => {
        clearInterval(id);
        clearTimeout(startId);
      };
    }
  }, [phase]);

  const placeBet = () => {
    if (phase !== "waiting" && phase !== "crashed" && phase !== "cashed_out") return;
    if (!user || user.balance < bet) {
      setMsg("Недостаточно средств!");
      return;
    }
    setHasBet(true);
    setMsg("✅ Ставка принята! Жди старта...");
  };

  const cancelBet = () => {
    if (phase === "flying") return;
    setHasBet(false);
    setMsg("");
  };

  // Initial start
  useEffect(() => {
    const id = setTimeout(() => {
      startRound();
    }, 2000);
    return () => {
      clearTimeout(id);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const multColor = multiplier >= 10 ? "text-purple-400" :
    multiplier >= 5 ? "text-blue-400" :
    multiplier >= 2 ? "text-green-400" :
    multiplier >= 1.5 ? "text-yellow-400" : "text-white";

  const isPlaneVisible = phase === "flying" || phase === "cashed_out";
  const planeX = Math.min(85, 10 + (multiplier - 1) * 15);
  const planeY = Math.max(15, 80 - (multiplier - 1) * 15);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/games" className="text-gray-500 hover:text-yellow-400 transition-colors text-sm">← Игры</Link>
        </div>

        <h1 className="text-3xl font-black text-white mb-2 text-center">✈️ Краш</h1>
        <p className="text-gray-500 text-center text-sm mb-6">Самолёт летит вверх — коэффициент растёт. Успей забрать!</p>

        {!user ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Войдите для игры</p>
            <Link to="/login" className="bg-yellow-500 text-black font-bold px-6 py-2.5 rounded-xl hover:bg-yellow-400">Войти</Link>
          </div>
        ) : (
          <>
            {/* Game display */}
            <div className={`relative bg-gradient-to-b from-[#020215] to-[#0a0a1a] border-2 rounded-2xl overflow-hidden mb-4 ${
              phase === "crashed" ? "border-red-500/70" :
              phase === "cashed_out" ? "border-green-500/70" :
              "border-gray-700/50"
            }`} style={{ height: "240px" }}>

              {/* Grid lines */}
              <div className="absolute inset-0 opacity-10">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="absolute border-b border-white/30" style={{ top: `${(i + 1) * 16}%`, left: 0, right: 0 }} />
                ))}
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="absolute border-r border-white/30" style={{ left: `${(i + 1) * 12}%`, top: 0, bottom: 0 }} />
                ))}
              </div>

              {/* Trajectory path */}
              {isPlaneVisible && (
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path
                    d={`M 5 90 Q ${planeX * 0.3} ${90 - (90 - planeY) * 0.5} ${planeX} ${planeY}`}
                    fill="none"
                    stroke={phase === "cashed_out" ? "#22c55e" : "#3b82f6"}
                    strokeWidth="0.5"
                    strokeDasharray="2,1"
                    opacity="0.5"
                  />
                </svg>
              )}

              {/* Plane */}
              {isPlaneVisible && (
                <div
                  className="absolute text-3xl transition-none select-none"
                  style={{
                    left: `${planeX}%`,
                    top: `${planeY}%`,
                    transform: "translate(-50%, -50%)",
                    filter: phase === "cashed_out" ? "drop-shadow(0 0 8px #22c55e)" : "drop-shadow(0 0 6px #3b82f6)",
                  }}
                >
                  ✈️
                </div>
              )}

              {/* Crash explosion */}
              {phase === "crashed" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">💥</div>
                    <div className="text-red-400 font-black text-2xl">КРАШ!</div>
                  </div>
                </div>
              )}

              {/* Center multiplier */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  {phase === "waiting" ? (
                    <div className="text-gray-500 text-lg font-bold">
                      {countdown > 0 ? `Старт через ${countdown}с...` : "Ожидание..."}
                    </div>
                  ) : (
                    <>
                      <div className={`font-black leading-none ${multColor}`}
                        style={{ fontSize: phase === "crashed" ? "0" : "clamp(2rem,8vw,4rem)" }}>
                        {phase !== "crashed" && `x${multiplier.toFixed(2)}`}
                      </div>
                      {phase === "cashed_out" && cashedAt && (
                        <div className="text-green-400 font-black text-2xl mt-2">
                          ✅ Забрал x{cashedAt.toFixed(2)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Countdown overlay */}
              {(phase === "crashed" || phase === "cashed_out") && countdown > 0 && (
                <div className="absolute bottom-3 right-4 text-gray-500 text-sm">
                  Новый раунд через {countdown}с...
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl p-5 mb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Ставка (К)</label>
                  <input
                    type="number"
                    value={bet}
                    onChange={(e) => setBet(Math.max(10, Math.min(user.balance, parseInt(e.target.value) || 10)))}
                    disabled={phase === "flying" || hasBet}
                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-yellow-500 disabled:opacity-50"
                  />
                  <div className="flex gap-1 mt-1.5">
                    {[10, 50, 100].map((v) => (
                      <button key={v}
                        onClick={() => setBet(Math.min(user.balance, v))}
                        disabled={phase === "flying" || hasBet}
                        className="text-xs border border-gray-700 text-gray-500 hover:border-yellow-500 hover:text-yellow-400 px-2 py-0.5 rounded transition-all flex-1 disabled:opacity-30">
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Авто-вывод (x)</label>
                  <input
                    type="number"
                    value={autoCashout}
                    onChange={(e) => setAutoCashout(e.target.value)}
                    disabled={phase === "flying"}
                    placeholder="Нет"
                    min="1.1"
                    step="0.1"
                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 disabled:opacity-50"
                  />
                  <div className="flex gap-1 mt-1.5">
                    {[2, 3, 5, 10].map((v) => (
                      <button key={v}
                        onClick={() => setAutoCashout(v)}
                        disabled={phase === "flying"}
                        className="text-xs border border-gray-700 text-gray-500 hover:border-yellow-500 hover:text-yellow-400 px-2 py-0.5 rounded transition-all flex-1 disabled:opacity-30">
                        x{v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bet / Cashout button */}
              {phase === "flying" && hasBet && !cashedAt ? (
                <button
                  onClick={() => cashOut(multiplier)}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white font-black py-4 rounded-xl hover:from-green-500 hover:to-green-400 transition-all text-lg animate-pulse"
                >
                  💰 ЗАБРАТЬ x{multiplier.toFixed(2)} = {(bet * multiplier).toFixed(0)} К
                </button>
              ) : hasBet && phase !== "flying" ? (
                <div className="flex gap-2">
                  <div className="flex-1 bg-green-500/10 border border-green-500/30 text-green-400 font-bold py-3 rounded-xl text-center text-sm">
                    ✅ Ставка {bet} К принята
                  </div>
                  <button
                    onClick={cancelBet}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-3 rounded-xl transition-all text-sm"
                  >
                    Отмена
                  </button>
                </div>
              ) : (
                <button
                  onClick={placeBet}
                  disabled={phase === "flying" || !user || user.balance < bet}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-black py-4 rounded-xl hover:from-red-500 hover:to-orange-500 transition-all text-lg disabled:opacity-50"
                >
                  🎲 Поставить {bet} К
                </button>
              )}
            </div>

            {/* Message */}
            {msg && (
              <div className={`text-center py-3 rounded-xl font-bold text-sm mb-4 ${
                msg.startsWith("✅") || msg.startsWith("💰")
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : msg.startsWith("💥")
                  ? "bg-red-500/10 border border-red-500/30 text-red-400"
                  : "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
              }`}>
                {msg}
              </div>
            )}

            {/* Balance */}
            <div className="text-center text-gray-600 text-sm mb-6">
              Баланс: <span className="text-yellow-400 font-bold">{user.balance.toFixed(0)} К</span>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-gray-400 mb-3">История раундов</h3>
                <div className="flex flex-wrap gap-2">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        h.won
                          ? "bg-green-500/10 border border-green-500/30 text-green-400"
                          : "bg-red-500/10 border border-red-500/30 text-red-400"
                      }`}
                    >
                      x{h.mult.toFixed(2)}
                      {h.won ? ` +${h.profit.toFixed(0)}К` : ""}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
