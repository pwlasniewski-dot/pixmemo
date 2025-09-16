import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { readDraft, clearDraft } from "../store/bookingDraft";
import { createP24Session } from "../api/payments";
import { updateBookingStatus } from "../api/client";

export default function CheckoutP24Page() {
  const draft = readDraft();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!draft) return <p>Brak danych rezerwacji.</p>;

  const start = async () => {
    setError(null);
    setLoading(true);
    try {
      const successUrl = `${window.location.origin}/pixmemo/payment/success`;
      await createP24Session({
        bookingId: draft.bookingId,
        amountPln: draft.price.total,
        successUrl,
      });
      await updateBookingStatus(draft.bookingId, "confirmed");
      const query = new URLSearchParams({
        bookingId: draft.bookingId,
        status: "confirmed",
        method: "p24",
        amount: String(draft.price.total),
      });
      if (draft.trackToken) query.set("track", draft.trackToken);
      clearDraft();
      nav(`/payment/success?${query.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się utworzyć płatności");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Przelewy24 / BLIK</h1>
      <p className="text-zinc-600">
        Rezerwacja <b>{draft.photographerName}</b>, termin {draft.date} o {draft.slot}. Kwota do zapłaty: <b>
          {draft.price.total} PLN
        </b>
      </p>
      <button
        className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
        onClick={start}
        disabled={loading}
      >
        {loading ? "Przetwarzanie…" : "Zapłać z Przelewy24"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-zinc-500">DEMO: płatność jest potwierdzana lokalnie bez przekierowania do operatora.</p>
    </section>
  );
}
