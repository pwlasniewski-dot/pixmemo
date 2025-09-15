import { readDraft, clearDraft } from "../store/bookingDraft";
import { createP24Session } from "../api/payments";

export default function CheckoutP24Page() {
  const draft = readDraft();
  if (!draft) return <p>Brak danych rezerwacji.</p>;

  const start = async () => {
    try {
      const res = await createP24Session({ booking_id: "demo-booking-uuid", amount_pln: draft.price.total });
      // w realu przekierowanie na P24:
      window.location.href = res.redirectUrl;
    } catch {
      // DEMO fallback – bez BE:
      clearDraft();
      window.location.href = "/pixmemo/payment/success";
    }
  };

  return (
    <section className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Przelewy24 / BLIK</h1>
      <p className="text-zinc-600">Kliknij, aby przejść do bramki płatniczej (DEMO: sukces bez przejścia).</p>
      <button
        className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
        onClick={start}
      >
        Zapłać {draft.price.total} PLN z Przelewy24 (DEMO)
      </button>
    </section>
  );
}
