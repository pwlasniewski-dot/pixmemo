import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Podaj e-mail oraz hasło.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (user.role === "photographer") {
        nav("/dashboard/photographer", { replace: true });
      } else if (user.role === "admin") {
        nav("/dashboard/admin", { replace: true });
      } else {
        nav("/", { replace: true });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nie udało się zalogować.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Logowanie</h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full px-3 py-2 rounded-lg border"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          autoFocus
        />
        <input
          className="w-full px-3 py-2 rounded-lg border"
          placeholder="Hasło"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Logowanie…" : "Zaloguj"}
        </button>
      </form>
      <p className="text-sm text-zinc-600">
        Nie masz konta?{" "}
        <Link to="/auth/register-photographer" className="underline">
          Zarejestruj jako fotograf
        </Link>
      </p>
    </section>
  );
}

