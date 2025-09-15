import { Link } from 'react-router-dom'

export default function PixMemoHome() {
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-10">
      <header className="text-center space-y-2">
        <h1 className="text-3xl md:text-5xl font-bold">PixMemo – MVP</h1>
        <p className="text-zinc-600">Minimalna wersja startowa z React Router i Tailwind.</p>
      </header>

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-2">Co dalej?</h2>
          <ul className="list-disc pl-5 space-y-1 text-zinc-700">
            <li>Dodaj profile fotografów i rezerwacje.</li>
            <li>Skonfiguruj <code>VITE_API_URL</code> i podłącz API.</li>
            <li>Zbuduj (<code>npm run build</code>) i wrzuć <code>dist/</code> na <code>/pixmemo/</code>.</li>
          </ul>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-2">Nawigacja (demo)</h2>
          <div className="flex gap-2">
            <Link to="/" className="btn">Start</Link>
            {/* Przyszłe podstrony:
                <Link to="/photographers" className="btn">Fotografowie</Link>
                <Link to="/booking" className="btn">Rezerwacja</Link>
             */}
          </div>
        </div>
      </section>

      <footer className="text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} PixMemo
      </footer>
    </main>
  )
}
