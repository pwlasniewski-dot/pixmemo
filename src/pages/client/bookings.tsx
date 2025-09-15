// src/pages/client/bookings.tsx
import { useEffect, useMemo, useState } from "react";
import { getClientBookings } from "@/api/client";
import { Link } from "react-router-dom";

type Booking = {
  id: string;
  date: string;
  time: string;
  address?: { city?: string };
  priceFinalPln: number;
  status: "pending" | "awaiting_payment" | "confirmed" | "done" | "cancelled";
  trackToken?: string;
};

const LS_KEY = "pm_client_email";

export default function ClientBookingsPage() {
  const [email, setEmail] = useState<string>(
    () => localStorage.getItem(LS_KEY) || ""
  );
  const [list, setList] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const validEmail = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);

  useEffect(() => {
    if (!validEmail) return;
    setLoading(true);
    setErr(null);
    localStorage.setItem(LS_KEY, email);
    getClientBookings(email)
      .then((res) => setList(res as Booking[]))
      .catch((e) => setErr(e?.message || "Nie udało się pobrać rezerwacji."))
      .finally(() => setLoading(false));
  }, [email, validEmail]);

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Moje rezerwacje</h1>

      <div className="rounded-2xl border p-4 space-y-2">
        <label className="text-sm text-zinc-600">E-mail użyty przy rezerwacji</label>
        <div className="flex items-center gap-2">
          <input
            className="px-3 py-2 rounded-lg border min-w-[260px]"
            placeholder="np. anna@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            inputMode="email"
          />
          {!validEmail && email && (
            <span className="text-xs text-amber-700">
              Podaj poprawny adres e-mail.
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border p-3">Ładuję…</div>
      ) : err ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-800">
          {err}
        </div>
      ) : !validEmail ? (
        <p className="text-zinc-600">Podaj e-mail, aby wyświetlić rezerwacje.</p>
      ) : list.length === 0 ? (
        <p className="text-zinc-600">Brak rezerwacji dla {email}.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((b) => (
            <li key={b.id} className="rounded-2xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">
                    {b.date} {b.time} · {b.address?.city || "—"}
                  </div>
                  <div className="text-xs text-zinc-600">
                    Status: <span className="uppercase">{b.status}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    Suma: <b>{b.priceFinalPln} PLN</b>
                  </div>
                  {b.status === "confirmed" && b.trackToken && (
                    <Link
                      to={`/track/${b.trackToken}`}
                      className="inline-block mt-1 text-sm text-blue-600 underline"
                    >
                      Śledź fotografa (LIVE)
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
