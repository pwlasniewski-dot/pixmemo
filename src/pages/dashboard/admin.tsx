import { useEffect, useMemo, useState } from "react";
import {
  AdminBooking,
  AdminPhotographer,
  approvePhotographer,
  createMockBooking,
  createMockPhotographer,
  listBookings,
  listPhotographers,
  rejectPhotographer,
  resetAdminDemo,
  startReviewPhotographer,
  updateBookingStatus,
} from "../../api/mock_admin";

type Tab = "photographers" | "bookings";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="rounded-2xl border p-4">{children}</div>
    </section>
  );
}

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>("photographers");

  // Filtry
  const [pFilter, setPFilter] = useState<AdminPhotographer["status"] | "all">("submitted");
  const [bFilter, setBFilter] = useState<AdminBooking["status"] | "all">("awaiting_payment");

  // Dane
  const [photographers, setPhotographers] = useState<AdminPhotographer[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);

  const loadP = () =>
    setPhotographers(pFilter === "all" ? listPhotographers() : listPhotographers(pFilter));
  const loadB = () =>
    setBookings(bFilter === "all" ? listBookings() : listBookings(bFilter));

  useEffect(() => {
    loadP();
  }, [pFilter]);

  useEffect(() => {
    loadB();
  }, [bFilter]);

  const counts = useMemo(() => {
    const all = listPhotographers();
    const c = (s: AdminPhotographer["status"]) => all.filter((x) => x.status === s).length;
    return {
      submitted: c("submitted"),
      under_review: c("under_review"),
      approved: c("approved"),
      rejected: c("rejected"),
      total: all.length,
    };
  }, [photographers]);

  const bCounts = useMemo(() => {
    const all = listBookings();
    const c = (s: AdminBooking["status"]) => all.filter((x) => x.status === s).length;
    return {
      pending: c("pending"),
      awaiting_payment: c("awaiting_payment"),
      confirmed: c("confirmed"),
      done: c("done"),
      cancelled: c("cancelled"),
      total: all.length,
    };
  }, [bookings]);

  // Akcje fotografowie
  const doApprove = (id: string) => {
    approvePhotographer(id);
    loadP();
  };
  const doReject = (id: string) => {
    rejectPhotographer(id);
    loadP();
  };
  const doStartReview = (id: string) => {
    startReviewPhotographer(id);
    loadP();
  };

  // Akcje rezerwacje
  const setStatus = (id: string, status: AdminBooking["status"]) => {
    updateBookingStatus(id, status);
    loadB();
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Panel Admina</h1>
        <div className="ml-auto flex gap-2">
          <button
            className={`px-3 py-1.5 rounded-lg border ${tab === "photographers" ? "bg-zinc-100" : ""}`}
            onClick={() => setTab("photographers")}
          >
            Fotografowie
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg border ${tab === "bookings" ? "bg-zinc-100" : ""}`}
            onClick={() => setTab("bookings")}
          >
            Rezerwacje
          </button>
          <button
            className="px-3 py-1.5 rounded-lg border hover:bg-zinc-50"
            onClick={() => {
              resetAdminDemo();
              loadP();
              loadB();
            }}
            title="Przywróć dane DEMO"
          >
            Reset DEMO
          </button>
        </div>
      </header>

      {tab === "photographers" && (
        <>
          <Section title="Fotografowie — filtr">
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="px-3 py-2 rounded-lg border"
                value={pFilter}
                onChange={(e) => setPFilter(e.target.value as any)}
              >
                <option value="submitted">Zgłoszeni ({counts.submitted})</option>
                <option value="under_review">W trakcie weryfikacji ({counts.under_review})</option>
                <option value="approved">Zaakceptowani ({counts.approved})</option>
                <option value="rejected">Odrzuceni ({counts.rejected})</option>
                <option value="all">Wszyscy ({counts.total})</option>
              </select>

              <button
                className="ml-auto px-3 py-2 rounded-lg border hover:bg-zinc-50"
                onClick={() => {
                  createMockPhotographer({
                    full_name: "Nowy Fotograf " + Math.floor(Math.random() * 100),
                    city: "Toruń",
                    portfolio_count: 8 + Math.floor(Math.random() * 10),
                    verified: false,
                    status: "submitted",
                  });
                  loadP();
                }}
              >
                Dodaj testowego fotografa
              </button>
            </div>
          </Section>

          <Section title="Zgłoszenia fotografów">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-zinc-600">
                  <tr>
                    <th className="py-2 pr-4">Imię i nazwisko</th>
                    <th className="py-2 pr-4">Miasto</th>
                    <th className="py-2 pr-4">Portfolio</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Zgłoszono</th>
                    <th className="py-2 pr-4">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {photographers.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="py-2 pr-4 font-medium">{p.full_name}</td>
                      <td className="py-2 pr-4">{p.city}</td>
                      <td className="py-2 pr-4">{p.portfolio_count}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            p.status === "approved"
                              ? "bg-emerald-100 text-emerald-700"
                              : p.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : p.status === "under_review"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        {new Date(p.submitted_at).toLocaleString()}
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex flex-wrap gap-2">
                          {p.status !== "under_review" && p.status !== "approved" && (
                            <button
                              className="px-3 py-1.5 rounded-lg border hover:bg-zinc-50"
                              onClick={() => doStartReview(p.id)}
                            >
                              Weryfikuj
                            </button>
                          )}
                          {p.status !== "approved" && (
                            <button
                              className="px-3 py-1.5 rounded-lg border hover:bg-emerald-50"
                              onClick={() => doApprove(p.id)}
                            >
                              Akceptuj
                            </button>
                          )}
                          {p.status !== "rejected" && (
                            <button
                              className="px-3 py-1.5 rounded-lg border hover:bg-red-50"
                              onClick={() => doReject(p.id)}
                            >
                              Odrzuć
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {photographers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-zinc-500">
                        Brak wyników dla wybranego filtra.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>
        </>
      )}

      {tab === "bookings" && (
        <>
          <Section title="Rezerwacje — filtr">
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="px-3 py-2 rounded-lg border"
                value={bFilter}
                onChange={(e) => setBFilter(e.target.value as any)}
              >
                <option value="awaiting_payment">
                  Oczekuje na płatność ({bCounts.awaiting_payment})
                </option>
                <option value="pending">W trakcie (pending) ({bCounts.pending})</option>
                <option value="confirmed">Potwierdzone ({bCounts.confirmed})</option>
                <option value="done">Zrealizowane ({bCounts.done})</option>
                <option value="cancelled">Anulowane ({bCounts.cancelled})</option>
                <option value="all">Wszystkie ({bCounts.total})</option>
              </select>

              <button
                className="ml-auto px-3 py-2 rounded-lg border hover:bg-zinc-50"
                onClick={() => {
                  createMockBooking({
                    client_name: "Nowy Klient",
                    client_email: "klient@example.com",
                    photographer_name: "Jan Kowalski",
                    package_name: "Ekonomiczny",
                    date: new Date().toISOString().slice(0, 10),
                    time: "15:00",
                    price_pln: 400,
                    status: "pending",
                    payment_provider: "none",
                  });
                  loadB();
                }}
              >
                Dodaj testową rezerwację
              </button>
            </div>
          </Section>

          <Section title="Lista rezerwacji">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-zinc-600">
                  <tr>
                    <th className="py-2 pr-4">Klient</th>
                    <th className="py-2 pr-4">Fotograf</th>
                    <th className="py-2 pr-4">Pakiet</th>
                    <th className="py-2 pr-4">Data/Godz.</th>
                    <th className="py-2 pr-4">Cena</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Płatność</th>
                    <th className="py-2 pr-4">Utworzono</th>
                    <th className="py-2 pr-4">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-t">
                      <td className="py-2 pr-4">
                        <div className="font-medium">{b.client_name}</div>
                        <div className="text-xs text-zinc-500">{b.client_email}</div>
                      </td>
                      <td className="py-2 pr-4">{b.photographer_name}</td>
                      <td className="py-2 pr-4">{b.package_name}</td>
                      <td className="py-2 pr-4">
                        {b.date} {b.time}
                      </td>
                      <td className="py-2 pr-4">{b.price_pln} PLN</td>
                      <td className="py-2 pr-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            b.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-700"
                              : b.status === "done"
                              ? "bg-blue-100 text-blue-800"
                              : b.status === "awaiting_payment"
                              ? "bg-amber-100 text-amber-800"
                              : b.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-2 pr-4">{b.payment_provider.toUpperCase()}</td>
                      <td className="py-2 pr-4">
                        {new Date(b.created_at).toLocaleString()}
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex flex-wrap gap-2">
                          {b.status !== "confirmed" && (
                            <button
                              className="px-3 py-1.5 rounded-lg border hover:bg-emerald-50"
                              onClick={() => setStatus(b.id, "confirmed")}
                            >
                              Potwierdź
                            </button>
                          )}
                          {b.status !== "done" && (
                            <button
                              className="px-3 py-1.5 rounded-lg border hover:bg-blue-50"
                              onClick={() => setStatus(b.id, "done")}
                            >
                              Zrealizuj
                            </button>
                          )}
                          {b.status !== "cancelled" && (
                            <button
                              className="px-3 py-1.5 rounded-lg border hover:bg-red-50"
                              onClick={() => setStatus(b.id, "cancelled")}
                            >
                              Anuluj
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-zinc-500">
                        Brak wyników dla wybranego filtra.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>
        </>
      )}
    </div>
  );
}
