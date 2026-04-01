import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const API_URL = "https://functions.poehali.dev/d064e8c8-7fd9-44f4-94c4-3037f6718ed3";

export interface User {
  user_id: string;
  username: string;
  email: string;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (loginVal: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateBalance: (amount: number, type?: string, description?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("kc_user");
    const savedToken = localStorage.getItem("kc_token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка регистрации");
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("kc_user", JSON.stringify(data.user));
      localStorage.setItem("kc_token", data.token);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (loginVal: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: loginVal, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка входа");
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("kc_user", JSON.stringify(data.user));
      localStorage.setItem("kc_token", data.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("kc_user");
    localStorage.removeItem("kc_token");
  };

  const updateBalance = async (amount: number, type = "game", description = "") => {
    if (!user) return;
    const res = await fetch(`${API_URL}/balance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.user_id, amount, type, description }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Ошибка обновления баланса");
    const updated = { ...user, balance: data.balance };
    setUser(updated);
    localStorage.setItem("kc_user", JSON.stringify(updated));
  };

  const refreshProfile = async () => {
    if (!user) return;
    const res = await fetch(`${API_URL}/profile?user_id=${user.user_id}`);
    const data = await res.json();
    if (res.ok) {
      const updated = { ...user, balance: data.user.balance };
      setUser(updated);
      localStorage.setItem("kc_user", JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateBalance, refreshProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { API_URL };
