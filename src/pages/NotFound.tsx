import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="text-center space-y-3">
      <h1 className="text-3xl font-extrabold">404</h1>
      <p className="text-zinc-600">Nie znaleziono strony.</p>
      <Link to="/" className="inline-block px-4 py-2 rounded-lg border">
        Wróć do strony głównej
      </Link>
    </section>
  );
}
