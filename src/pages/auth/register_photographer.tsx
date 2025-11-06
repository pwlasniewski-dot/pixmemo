import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMockPhotographer } from "@/api/mock_admin";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPhotographerPage() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // „wysyłamy do weryfikacji” – zapis w mocku admina
    createMockPhotographer({
      full_name: fullName || "Nowy Fotograf",
      city: city || "Toruń",
      portfolio_count: 6,
      verified: false,
      status: "submitted",
    });
    try {
      await login({
        email: email.trim() || "fotograf@pixmemo.pl",
        password: "demo123",
        role: "photographer",
      });
      nav("/dashboard/photographer");
    } catch {
      nav("/auth/login", { replace: true });
    }
  };

  return (
    <section className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Rejestracja fotografa</h1>
      <p className="text-sm text-zinc-600">Po rejestracji profil trafi do weryfikacji admina.</p>
      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full px-3 py-2 rounded-lg border"
          placeholder="Imię i nazwisko"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          className="w-full px-3 py-2 rounded-lg border"
          placeholder="Miasto"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          className="w-full px-3 py-2 rounded-lg border"
          placeholder="E-mail (logowanie)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          Wyślij do weryfikacji
        </button>
      </form>
    </section>
  );
}
