import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPhotographer } from "../api/client";
import RatingStars from "../components/RatingStars";
import Spinner from "../components/Spinner";

export default function PhotographerPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [p, setP] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    getPhotographer(id!).then((res) => {
      setP(res);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <Spinner />;
  if (!p) return <p>Nie znaleziono fotografa.</p>;

  return (
    <section className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <img
          src={p.primary_photo_url}
          alt={p.full_name}
          className="w-full h-64 object-cover rounded-2xl border"
        />
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <img
              key={i}
              src={`${p.primary_photo_url}&n=${i}`}
              className="h-28 w-full object-cover rounded-xl border"
            />
          ))}
        </div>
      </div>

      <aside className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{p.full_name}</h1>
          <div className="text-zinc-600">{p.city}</div>
          <RatingStars value={p.rating_avg} count={p.rating_count} />
          {p.verified && (
            <div className="mt-2 text-xs rounded-full bg-emerald-100 text-emerald-700 inline-block px-2 py-0.5">
              Verified
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="font-semibold">Pakiety</h2>
          <ul className="space-y-2">
            {p.packages?.map((pk: any) => (
              <li
                key={pk.id}
                className="flex items-center justify-between rounded-xl border p-3"
              >
                <div>{pk.name}</div>
                <div className="font-semibold">{pk.price_pln} PLN</div>
              </li>
            ))}
          </ul>
        </div>

        <Link
          to={`/booking?photographerId=${p.id}`}
          className="w-full text-center block px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          Rezerwuj termin
        </Link>
      </aside>
    </section>
  );
}
