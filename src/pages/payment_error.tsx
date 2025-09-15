import { Link } from "react-router-dom";

export default function PaymentErrorPage() {
  return (
    <section className="max-w-md mx-auto text-center space-y-4">
      <h1 className="text-2xl font-bold text-red-600">Błąd płatności</h1>
      <p>Nie udało się przetworzyć płatności. Spróbuj ponownie albo wybierz inną metodę.</p>
      <Link to="/booking" className="inline-block mt-2 px-4 py-2 rounded-lg border">
        Wróć do rezerwacji
      </Link>
    </section>
  );
}
