import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getBooking, getPhotographer } from "@/api/client";

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const bookingId = params.get("bookingId");
  const method = params.get("method") ?? "stripe";
  const statusParam = params.get("status");
  const amount = params.get("amount");

  const [loading, setLoading] = useState<boolean>(!!bookingId);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [photographerName, setPhotographerName] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    setLoading(true);
    getBooking(bookingId)
      .then((data) => {
        setBooking(data);
        if (data?.photographerId) {
          getPhotographer(data.photographerId)
            .then((p) => setPhotographerName(p.full_name))
            .catch(() => setPhotographerName(null));
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Nie udało się pobrać rezerwacji");
        setLoading(false);
      });
  }, [bookingId]);

  const finalStatus = statusParam || booking?.status || "confirmed";

  return (
    <section className="max-w-xl mx-auto text-center space-y-4">
      <h1 className="text-2xl font-bold text-emerald-700">Rezerwacja potwierdzona 🎉</h1>
      {loading ? (
        <p>Ładujemy szczegóły rezerwacji…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="space-y-2 text-sm text-zinc-600">
          <p>
            Dziękujemy! Twoja płatność ({method === "p24" ? "Przelewy24/BLIK" : "Stripe"}) została
            zaksięgowana.
          </p>
          {bookingId && (
            <p>
              Numer rezerwacji: <b>{bookingId}</b>
            </p>
          )}
          {booking && (
            <p>
              Termin: <b>{booking.date}</b> o <b>{booking.time}</b>
              {photographerName && (
                <>
                  {" "}· fotograf <b>{photographerName}</b>
                </>
              )}
            </p>
          )}
          <p>
            Status w systemie: <b>{finalStatus}</b>
          </p>
          {amount && <p>Kwota zapłacona: {amount} PLN</p>}
          {booking?.trackToken && (
            <p>Token śledzenia: {booking.trackToken}</p>
          )}
        </div>
      )}

      <div className="flex justify-center gap-3 pt-2">
        <Link to="/" className="px-4 py-2 rounded-lg border">
          Wróć na stronę główną
        </Link>
        <Link to="/client/bookings" className="px-4 py-2 rounded-lg border">
          Zobacz moje rezerwacje
        </Link>
      </div>
    </section>
  );
}
