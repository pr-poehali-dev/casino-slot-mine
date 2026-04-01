import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

const GRID_SIZE = 25; // 5x5
const MINE_COUNTS = [1, 3, 5, 8, 12, 20];

// Multiplier table: [mines][revealed]
function getMultiplier(mines: number, revealed: number): number {
  if (revealed === 0) return 1;
  const safe = GRID_SIZE - mines;
  let mult = 1;
  for (let i = 0; i < revealed; i++) {
    mult *= (safe - i) / (GRID_SIZE - mines - i);
  }
  // Invert and scale for house edge
  const baseOdds = 1 / mult;
  return Math.max(1.01, parseFloat((baseOdds * 0.97 * (GRID_SIZE / (GRID_SIZE - mines))).toFixed(2)));
}

function calcPayout(bet: number, mines: number, revealed: number): number {
  return parseFloat((bet * getMultiplier(mines, revealed)).toFixed(2));
}

type CellState = "hidden" | "diamond" | "mine" | "empty_safe";

interface Cell {
  state: CellState;
  isMine: boolean;
}

function generateGrid(mines: number): Cell[] {
  const cells: Cell[] = Array(GRID_SIZE).fill(null).map(() => ({ state: "hidden", isMine: false }));
  const minePositions = new Set<number>();
  while (minePositions.size < mines) {
    minePositions.add(Math.floor(Math.random() * GRID_SIZE));
  }
  minePositions.forEach((pos) => { cells[pos].isMine = true; });
  return cells;
}

export default function Miner() {
  const { user, updateBalance } = useAuth();
  const [grid, setGrid] = useState<Cell[]>([]);
  const [mines, setMines] = useState(3);
  const [bet, setBet] = useState(10);
  const [gameActive, setGameActive] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [msg, setMsg] = useState("");

  const startGame = useCallback(async () => {
    if (!user || user.balance < bet) {
      setMsg("Недостаточно средств!");
      return;
    }
    try {
      await updateBalance(-bet, "game", `Минёр — ставка ${bet} К`);
    } catch {
      setMsg("Ошибка списания");
      return;
    }
    setGrid(generateGrid(mines));
    setRevealed(0);
    setGameActive(true);
    setGameOver(false);
    setWin(false);
    setMsg("");
  }, [user, bet, mines, updateBalance]);

  const handleCellClick = useCallback(async (index: number) => {
    if (!gameActive || gameOver || grid[index].state !== "hidden") return;
    const newGrid = [...grid];
    const cell = newGrid[index];

    if (cell.isMine) {
      // Reveal all mines
      newGrid.forEach((c, i) => {
        if (c.isMine) newGrid[i] = { ...c, state: "mine" };
        else if (c.state === "hidden") newGrid[i] = { ...c, state: "empty_safe" };
      });
      setGrid(newGrid);
      setGameOver(true);
      setGameActive(false);
      setMsg("💥 БУМ! Попал на мину! Игра окончена.");
      return;
    }

    newGrid[index] = { ...cell, state: "diamond" };
    setGrid(newGrid);
    const newRevealed = revealed + 1;
    setRevealed(newRevealed);

    // Check if all safe cells revealed
    const safeCells = GRID_SIZE - mines;
    if (newRevealed === safeCells) {
      const payout = calcPayout(bet, mines, newRevealed);
      await updateBalance(payout, "game", `Минёр — выигрыш ${payout} К`);
      setGameOver(true);
      setGameActive(false);
      setWin(true);
      setMsg(`🏆 Всё открыто! Выигрыш: ${payout} К!`);
    }
  }, [gameActive, gameOver, grid, revealed, mines, bet, updateBalance]);

  const cashOut = useCallback(async () => {
    if (!gameActive || revealed === 0) return;
    const payout = calcPayout(bet, mines, revealed);
    await updateBalance(payout, "game", `Минёр — забрал ${payout} К`);
    setGameActive(false);
    setGameOver(true);
    setWin(true);
    setMsg(`💰 Забрал ${payout} К! Отличная игра!`);

    // Reveal mines
    const newGrid = grid.map((c) => ({
      ...c,
      state: c.isMine ? ("mine" as CellState) : c.state === "hidden" ? ("empty_safe" as CellState) : c.state,
    }));
    setGrid(newGrid);
  }, [gameActive, revealed, bet, mines, updateBalance, grid]);

  const currentPayout = calcPayout(bet, mines, revealed);
  const currentMultiplier = getMultiplier(mines, revealed);

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/games" className="text-gray-500 hover:text-yellow-400 transition-colors text-sm">← Игры</Link>
        </div>

        <h1 className="text-3xl font-black text-white mb-2 text-center">💣 Минёр</h1>
        <p className="text-gray-500 text-center text-sm mb-6">Открывай 💎, избегай 💣. Забери выигрыш в любой момент!</p>

        {!user ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Войдите для игры</p>
            <Link to="/login" className="bg-yellow-500 text-black font-bold px-6 py-2.5 rounded-xl hover:bg-yellow-400">Войти</Link>
          </div>
        ) : (
          <>
            {/* Controls */}
            {!gameActive && (
              <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl p-5 mb-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Ставка (К)</label>
                    <input
                      type="number"
                      value={bet}
                      onChange={(e) => setBet(Math.max(10, Math.min(user.balance, parseInt(e.target.value) || 10)))}
                      className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-yellow-500"
                    />
                    <div className="flex gap-1 mt-1.5">
                      {[10, 50, 100].map((v) => (
                        <button key={v} onClick={() => setBet(Math.min(user.balance, v))}
                          className="text-xs border border-gray-700 text-gray-500 hover:border-yellow-500 hover:text-yellow-400 px-2 py-0.5 rounded transition-all flex-1">
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Количество мин</label>
                    <select
                      value={mines}
                      onChange={(e) => setMines(parseInt(e.target.value))}
                      className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-yellow-500"
                    >
                      {MINE_COUNTS.map((m) => (
                        <option key={m} value={m}>{m} мин{m === 1 ? "а" : m < 5 ? "ы" : ""}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={startGame}
                  disabled={user.balance < bet}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black py-3 rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-50"
                >
                  {gameOver && revealed > 0 ? "🔄 Играть снова" : "🎮 Начать игру"}
                </button>
              </div>
            )}

            {/* Active game info */}
            {gameActive && (
              <div className="bg-[#0d0d1a] border border-blue-500/30 rounded-2xl p-4 mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Открыто: {revealed} 💎</div>
                  <div className="text-xs text-gray-500">Множитель: <span className="text-yellow-400 font-bold">x{currentMultiplier.toFixed(2)}</span></div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Потенциал</div>
                  <div className="text-green-400 font-black text-lg">{currentPayout.toFixed(0)} К</div>
                </div>
                <button
                  onClick={cashOut}
                  disabled={revealed === 0}
                  className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2.5 rounded-xl transition-all disabled:opacity-30"
                >
                  Забрать
                </button>
              </div>
            )}

            {/* Grid */}
            {grid.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-4">
                {grid.map((cell, i) => (
                  <button
                    key={i}
                    onClick={() => handleCellClick(i)}
                    disabled={!gameActive || cell.state !== "hidden"}
                    className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all border-2 ${
                      cell.state === "hidden"
                        ? "bg-[#1a1a2e] border-gray-700 hover:border-blue-500 hover:bg-[#1a2a3e] active:scale-95 cursor-pointer"
                        : cell.state === "diamond"
                        ? "bg-blue-900/40 border-blue-500 scale-95"
                        : cell.state === "mine"
                        ? "bg-red-900/40 border-red-500"
                        : "bg-[#1a1a2e] border-gray-800 opacity-40"
                    }`}
                  >
                    {cell.state === "diamond" ? "💎" :
                     cell.state === "mine" ? "💥" :
                     cell.state === "empty_safe" ? "·" : ""}
                  </button>
                ))}
              </div>
            )}

            {/* Message */}
            {msg && (
              <div className={`text-center py-3 rounded-xl font-bold text-sm mb-4 ${
                win ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}>
                {msg}
              </div>
            )}

            {/* Restart after game over */}
            {gameOver && (
              <button
                onClick={startGame}
                disabled={user.balance < bet}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black py-3 rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-50 mb-4"
              >
                🔄 Играть снова
              </button>
            )}

            <div className="text-center text-gray-600 text-sm">
              Баланс: <span className="text-yellow-400 font-bold">{user.balance.toFixed(0)} К</span>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
