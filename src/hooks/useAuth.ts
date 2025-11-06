import { useCallback, useEffect, useMemo, useState } from "react";

export type Role = "client" | "photographer" | "admin";
export type User = { id: string; email: string; role: Role; profileId?: string };

type StoredAuth = { user: User | null; token: string | null };

const API = import.meta.env.VITE_API_URL || "http://localhost:5174";
const USER_KEY = "pm_auth_user";
const TOKEN_KEY = "pm_auth_token";

function readStored(): StoredAuth {
  try {
    const rawUser = localStorage.getItem(USER_KEY);
    const rawToken = localStorage.getItem(TOKEN_KEY);
    return { user: rawUser ? (JSON.parse(rawUser) as User) : null, token: rawToken };
  } catch {
    return { user: null, token: null };
  }
}

function persist(user: User | null, token: string | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    let message = "Wystąpił błąd";
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {}
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export function useAuth() {
  const [{ user, token }, setAuth] = useState<StoredAuth>(() => readStored());
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    const stored = readStored();
    setAuth(stored);
    if (!stored.token) return;
    setLoading(true);
    request<{ token: string; user: User }>(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${stored.token}` },
    })
      .then((data) => {
        if (cancelled) return;
        persist(data.user, data.token);
        setAuth({ user: data.user, token: data.token });
      })
      .catch(() => {
        if (cancelled) return;
        persist(null, null);
        setAuth({ user: null, token: null });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (payload: { email: string; password: string; role?: Role }) => {
      setLoading(true);
      try {
        const data = await request<{ token: string; user: User }>(`${API}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        persist(data.user, data.token);
        setAuth({ user: data.user, token: data.token });
        return data.user;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(`${API}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // ignore network issues during logout
    } finally {
      persist(null, null);
      setAuth({ user: null, token: null });
    }
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isLoggedIn: !!user,
      loading,
    }),
    [user, token, login, logout, loading]
  );

  return value;
}
