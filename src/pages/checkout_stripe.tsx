import { useEffect, useMemo, useState } from "react";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements, AddressElement } from "@stripe/react-stripe-js";
import { readDraft, clearDraft } from "../store/bookingDraft";
import { createStripeIntent } from "../api/payments";
import { useNavigate } from "react-router-dom";

const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const nav = useNavigate();
  const draft = readDraft();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!draft) return <p>Brak danych rezerwacji.</p>;

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + "/pixmemo/payment/success" },
      redirect: "if_required",
    });
    setSubmitting(false);

    if (error) {
      setError(error.message || "Błąd płatności");
    } else {
      clearDraft();
      nav("/payment/success");
    }
  };

  return (
    <form onSubmit={pay} className="space-y-4">
      <PaymentElement />
      <button
        disabled={submitting || !stripe || !elements}
        className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Przetwarzanie..." : `Zapłać ${draft.price.total} PLN`}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-zinc-500">
        Test: użyj karty 4242 4242 4242 4242 + dowolny CVC/data (tryb testowy Stripe).
      </p>
    </form>
  );
}

export default function CheckoutStripePage() {
  const draft = readDraft();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (!draft) return;
    if (!pk) {
      // Brak klucza → tryb demo (bez realnych płatności)
      setDemo(true);
      return;
    }
    // W prawdziwej wersji najpierw tworzysz booking w BE i dostajesz booking_id; tu użyjemy fikcyjnego
    createStripeIntent({ booking_id: "demo-booking-uuid", amount_pln: draft.price.total })
      .then(res => setClientSecret(res.clientSecret))
      .catch(() => setDemo(true)); // jak brak BE, przełączamy na demo
  }, []);

  const stripePromise = useMemo(() => (pk ? loadStripe(pk) : null), []);
  const options: StripeElementsOptions | undefined = clientSecret
    ? { clientSecret, appearance: { theme: "stripe" } }
    : undefined;

  if (!draft) return <p>Brak danych rezerwacji.</p>;

  if (demo || !stripePromise) {
    // DEMO: bez Stripe – „udawana” płatność
    return (
      <section className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Płatność (DEMO)</h1>
        <p className="text-zinc-600">
          Nie ustawiono klucza <code>VITE_STRIPE_PUBLISHABLE_KEY</code>.
          Kliknij poniżej, aby zasymulować udaną płatność.
        </p>
        <button
          className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
          onClick={() => { clearDraft(); nav("/payment/success"); }}
        >
          Zapłać {draft.price.total} PLN (symulacja)
        </button>
      </section>
    );
  }

  if (!clientSecret) return <p>Ładowanie płatności…</p>;

  return (
    <section className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Płatność online</h1>
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm />
      </Elements>
    </section>
  );
}
