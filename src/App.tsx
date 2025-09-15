import { Link, NavLink, Outlet } from "react-router-dom";

export default function App() {
  const navLink =
    "px-3 py-2 rounded-lg text-sm font-medium hover:bg-zinc-100 transition";
  const active = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${navLink} bg-zinc-100` : navLink;

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
          <Link to="/" className="font-bold text-xl">PixMemo</Link>
          <nav className="ml-auto flex items-center gap-1">
            <NavLink to="/photographers" className={active}>
              Fotografowie
            </NavLink>
            <NavLink to="/auth/login" className={active}>
              Zaloguj
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t py-6 mt-16 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} PixMemo
      </footer>
    </div>
  );
}
