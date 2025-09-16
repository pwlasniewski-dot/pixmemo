import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"photographer" | "admin" | "client">("photographer");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Podaj e-mail i hasło.");
      return;
    }
    setSubmitting(true);
    try {
      const user = await login({ email: email.trim(), password: password.trim(), role });
      if (user.role === "photographer") nav("/dashboard/photographer");
      else if (user.role === "admin") nav("/dashboard/admin");
      else nav("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logowanie nie powiodło się");
    } finally {
      setSubmitting(false);
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
          autoFocus
        />
        <input
          type="password"
          className="w-full px-3 py-2 rounded-lg border"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          className="w-full px-3 py-2 rounded-lg border"
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
        >
          <option value="photographer">Fotograf</option>
          <option value="admin">Admin</option>
          <option value="client">Klient (podgląd)</option>
        </select>
        <button
          disabled={submitting}
          className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          {submitting ? "Logowanie…" : "Zaloguj"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-sm text-zinc-600">
        Nie masz konta?{" "}
        <Link to="/auth/register-photographer" className="underline">
          Zarejestruj jako fotograf
        </Link>
      </p>
      <div className="text-xs text-zinc-500 space-y-1">
        <p>Demo konta:</p>
        <ul className="list-disc list-inside">
          <li>fotograf@pixmemo.pl / demo123</li>
          <li>admin@pixmemo.pl / demo123</li>
          <li>klient@pixmemo.pl / demo123</li>
        </ul>
      </div>
    </section>
  );
}
