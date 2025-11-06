import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { readDraft, clearDraft } from "../store/bookingDraft";
import { createStripeSession } from "../api/payments";
import { updateBookingStatus } from "../api/client";

export default function CheckoutStripePage() {
  const draft = readDraft();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!draft) return <p>Brak danych rezerwacji.</p>;

  const pay = async () => {
    setError(null);
    setLoading(true);
    try {
      const successUrl = `${window.location.origin}/pixmemo/payment/success`;
      await createStripeSession({
        bookingId: draft.bookingId,
        amountPln: draft.price.total,
        successUrl,
        cancelUrl: `${window.location.origin}/pixmemo/checkout/stripe`,
      });
      await updateBookingStatus(draft.bookingId, "confirmed");
      const query = new URLSearchParams({
        bookingId: draft.bookingId,
        status: "confirmed",
        method: "stripe",
        amount: String(draft.price.total),
      });
      if (draft.trackToken) query.set("track", draft.trackToken);
      clearDraft();
      nav(`/payment/success?${query.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Płatność nie powiodła się");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Płatność Stripe</h1>
      <p className="text-sm text-zinc-600">
        Rezerwacja <b>{draft.photographerName}</b>, termin {draft.date} o {draft.slot}. Kwota do zapłaty: <b>
          {draft.price.total} PLN
        </b>
      </p>
      <button
        onClick={pay}
        disabled={loading}
        className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Przetwarzanie…" : "Zapłać z Stripe"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-zinc-500">
        DEMO: zamiast realnego przekierowania do Stripe wywołujemy endpoint backendu i oznaczamy rezerwację jako
        opłaconą.
      </p>
    </section>
  );
}
