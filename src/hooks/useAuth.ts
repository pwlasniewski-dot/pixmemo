import { useEffect, useState } from "react";

type Role = "client" | "photographer" | "admin";
export type User = { id: string; email: string; role: Role };

const KEY = "pm_auth_user";

function read(): User | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}
function write(u: User | null) {
  if (u) localStorage.setItem(KEY, JSON.stringify(u));
  else localStorage.removeItem(KEY);
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => read());
  useEffect(() => setUser(read()), []);

  const login = (email: string, role: Role) => {
    const u: User = { id: crypto.randomUUID?.() || String(Date.now()), email, role };
    write(u); setUser(u);
    return u;
  };
  const logout = () => { write(null); setUser(null); };

  return { user, login, logout, isLoggedIn: !!user };
}
