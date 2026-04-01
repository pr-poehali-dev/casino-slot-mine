import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: "Главная", path: "/" },
    { label: "Игры", path: "/games" },
    { label: "Бонусы", path: "/bonuses" },
    { label: "Переводы", path: "/transfer" },
    { label: "Профиль", path: "/profile" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d1a]/95 backdrop-blur border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🎰</span>
            <span className="font-bold text-xl text-yellow-400 tracking-wide">KazahCasino</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "text-yellow-400"
                    : "text-gray-400 hover:text-yellow-300"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="bg-[#1a1a2e] border border-yellow-500/30 rounded-lg px-3 py-1.5 text-sm">
                  <span className="text-gray-400">Баланс: </span>
                  <span className="text-yellow-400 font-bold">{user.balance.toFixed(0)} К</span>
                </div>
                <div className="text-xs text-gray-500">ID: {user.user_id}</div>
                <button
                  onClick={logout}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors border border-gray-700 rounded px-2 py-1"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-400 hover:text-white transition-colors border border-gray-700 rounded px-3 py-1.5"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-yellow-500 text-black font-bold rounded px-3 py-1.5 hover:bg-yellow-400 transition-colors"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden text-gray-400 hover:text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="w-5 h-0.5 bg-current mb-1" />
            <div className="w-5 h-0.5 bg-current mb-1" />
            <div className="w-5 h-0.5 bg-current" />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0d0d1a] border-t border-gray-800 px-4 py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium py-2 ${isActive(item.path) ? "text-yellow-400" : "text-gray-400"}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <div className="text-sm text-yellow-400 font-bold">Баланс: {user.balance.toFixed(0)} К</div>
                <div className="text-xs text-gray-500">ID: {user.user_id}</div>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="text-red-400 text-sm text-left">
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-400" onClick={() => setMenuOpen(false)}>Войти</Link>
                <Link to="/register" className="text-sm text-yellow-400 font-bold" onClick={() => setMenuOpen(false)}>Регистрация</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Content */}
      <div className="pt-16 min-h-screen">{children}</div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16 py-8 text-center text-gray-600 text-sm">
        <div className="text-yellow-500/60 font-bold mb-1">🎰 KazahCasino</div>
        <div>Играйте ответственно. 18+</div>
      </footer>
    </div>
  );
}
