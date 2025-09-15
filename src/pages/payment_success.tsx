import { Link } from "react-router-dom";

export default function PaymentSuccessPage() {
  return (
    <section className="max-w-md mx-auto text-center space-y-4">
      <h1 className="text-2xl font-bold text-emerald-700">Płatność potwierdzona 🎉</h1>
      <p>Potwierdzenie wysłaliśmy e-mailem (DEMO). W panelu rezerwacja ma status <b>confirmed</b>.</p>
      <Link to="/" className="inline-block mt-2 px-4 py-2 rounded-lg border">
        Wróć na stronę główną
      </Link>
    </section>
  );
}
