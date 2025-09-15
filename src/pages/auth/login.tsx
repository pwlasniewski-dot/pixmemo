import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"photographer" | "admin" | "client">("photographer");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email || "demo@example.com", role);
    if (role === "photographer") nav("/dashboard/photographer");
    else if (role === "admin") nav("/dashboard/admin");
    else nav("/");
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
          className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          Zaloguj
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
