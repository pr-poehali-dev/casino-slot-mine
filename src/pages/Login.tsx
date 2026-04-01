import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: "", password: "" });
  const [error, setError] = useState("");

  if (user) {
    navigate("/profile");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.login, form.password);
      navigate("/profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">🎰</div>
              <h1 className="text-2xl font-black text-white">Вход</h1>
              <p className="text-gray-500 text-sm mt-1">Войдите в свой аккаунт KazahCasino</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-6">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Логин или Email</label>
                <input
                  type="text"
                  value={form.login}
                  onChange={(e) => setForm({ ...form, login: e.target.value })}
                  placeholder="Логин или email"
                  className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Пароль</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Введите пароль"
                  className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? "Вход..." : "Войти"}
              </button>
            </form>

            <p className="text-center text-gray-600 text-sm mt-6">
              Нет аккаунта?{" "}
              <Link to="/register" className="text-yellow-400 hover:text-yellow-300">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
