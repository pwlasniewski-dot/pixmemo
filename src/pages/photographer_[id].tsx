import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPhotographer } from "../api/client";
import RatingStars from "../components/RatingStars";
import Spinner from "../components/Spinner";
import { getAvgRating, listReviews } from "@/api/mock_reviews";
import ReviewsList from "@/components/reviews/ReviewsList";
import ReviewForm from "@/components/reviews/ReviewForm";
import type { Photographer } from "@/types";

export default function PhotographerPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [p, setP] = useState<Photographer | null>(null);

  // opinie
  const [avg, setAvg] = useState<{avg:number;count:number}>({avg:0, count:0});
  const [reviews, setReviews] = useState<any[]>([]);

  const refreshReviews = () => {
    if (!id) return;
    setAvg(getAvgRating(id));
    setReviews(listReviews(id));
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getPhotographer(id)
      .then((res) => {
        setP(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Nie udało się pobrać danych");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => { refreshReviews(); }, [id]);

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!p) return <p>Nie znaleziono fotografa.</p>;

  const upcoming = p.availability?.find((d) => d.slots.length > 0);

  return (
    <section className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <img src={p.primary_photo_url} alt={p.full_name}
          className="w-full h-64 object-cover rounded-2xl border" />
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <img key={i} src={`${p.primary_photo_url}&n=${i}`}
              className="h-28 w-full object-cover rounded-xl border" />
          ))}
        </div>

        {/* Opinie */}
        <div className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold">
            Opinie ({avg.count}) — średnia {avg.count ? `${avg.avg}★` : "—"}
          </h2>
          <ReviewsList items={reviews} />
          <div className="mt-3">
            <h3 className="font-medium mb-1">Dodaj opinię</h3>
            <ReviewForm photographerId={id!} onAdded={refreshReviews} />
          </div>
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

        <div className="space-y-3">
          <p className="text-sm text-zinc-600 whitespace-pre-line">{p.bio || p.short_bio}</p>
          <div className="text-sm text-zinc-500 space-y-1">
            {p.languages && p.languages.length > 0 && (
              <div>Języki: {p.languages.join(", ")}</div>
            )}
            {typeof p.travel_km === "number" && (
              <div>Dojeżdża w promieniu ok. {p.travel_km} km</div>
            )}
            {upcoming && (
              <div>Najbliższy dostępny termin: {upcoming.date}</div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="font-semibold">Pakiety</h2>
          <ul className="space-y-2">
            {p.packages?.map((pk) => (
              <li key={pk.id} className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <div className="font-medium">{pk.name}</div>
                  {pk.description && (
                    <div className="text-xs text-zinc-500 mt-1">{pk.description}</div>
                  )}
                </div>
                <div className="font-semibold">{pk.price_pln} PLN</div>
              </li>
            ))}
            {(!p.packages || p.packages.length === 0) && (
              <li className="text-sm text-zinc-500">Brak dodanych pakietów.</li>
            )}
          </ul>
        </div>

        <Link to={`/booking?photographerId=${p.id}`}
          className="w-full text-center block px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">
          Rezerwuj termin
        </Link>

        <Link to={`/track/${p.id}`}
          className="w-full text-center block px-4 py-3 rounded-xl border hover:bg-zinc-50">
          Zobacz lokalizację (LIVE)
        </Link>
      </aside>
    </section>
  );
}
