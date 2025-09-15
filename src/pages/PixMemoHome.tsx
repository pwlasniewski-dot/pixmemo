import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function PixMemoHome() {
  const nav = useNavigate();
  const [city, setCity] = useState("");
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (date) params.set("date", date);
    nav(`/photographers?${params.toString()}`);
  };

  return (
    <section className="grid md:grid-cols-2 gap-10 items-center">
      <div className="space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Fotograf na dziś / jutro
        </h1>
        <p className="text-zinc-600">
          Zarezerwuj sesję w 2 kliknięcia — lokalnie, szybko i bezpisowo.
        </p>

        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            className="px-3 py-2 rounded-lg border"
            placeholder="Miasto (np. Toruń)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <input
            type="date"
            className="px-3 py-2 rounded-lg border"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            type="submit"
          >
            SZUKAJ
          </button>
        </form>
      </div>

      <div className="rounded-3xl border overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1200"
          alt="PixMemo phone preview"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </section>
  );
}
