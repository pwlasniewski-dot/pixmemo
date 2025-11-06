import { useSyncExternalStore } from "react";

export type Role = "client" | "photographer" | "admin";
export type User = { id: string; email: string; role: Role };

const API = import.meta.env.VITE_API_URL || "http://localhost:5174";

const USER_KEY = "pm_auth_user";
const TOKEN_KEY = "pm_auth_token";

type AuthState = { user: User | null; token: string | null };

const subscribers = new Set<() => void>();

function readUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeUser(u: User | null) {
  if (typeof window === "undefined") return;
  try {
    if (u) window.localStorage.setItem(USER_KEY, JSON.stringify(u));
    else window.localStorage.removeItem(USER_KEY);
  } catch {
    // ignore storage errors (private mode, etc.)
  }
}

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore storage errors
  }
}

let state: AuthState = { user: readUser(), token: readToken() };

const getSnapshot = () => state;
const getServerSnapshot = () => state;

function subscribe(listener: () => void) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

function emit() {
  subscribers.forEach((listener) => listener());
}

function setState(next: AuthState) {
  state = { ...next };
  writeUser(state.user);
  writeToken(state.token);
  emit();
}

async function login(email: string, password: string) {
  const response = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errorMessage =
      payload && typeof (payload as any).error === "string"
        ? (payload as any).error
        : "Nie udało się zalogować. Sprawdź dane i spróbuj ponownie.";
    throw new Error(errorMessage);
  }

  const data = payload as { token?: string; user?: User } | null;
  if (!data?.token || !data.user) {
    throw new Error("Błędna odpowiedź serwera podczas logowania.");
  }

  setState({ user: data.user, token: data.token });
  return data.user;
}

function loginDemo(email: string, role: Role) {
  const user: User = {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
    email,
    role,
  };
  const token = `demo-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
  setState({ user, token });
  return user;
}

function logout() {
  setState({ user: null, token: null });
}

export function getAuthToken() {
  return state.token;
}

export function useAuth() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    user: snapshot.user,
    token: snapshot.token,
    isLoggedIn: !!snapshot.user,
    login,
    loginDemo,
    logout,
  };
}

