import { Link } from "react-router-dom";
import type { Photographer } from "../types";
import RatingStars from "./RatingStars";

export default function PhotoCard({ p }: { p: Photographer }) {
  return (
    <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
      <img
        src={p.primary_photo_url}
        alt={p.full_name}
        className="h-44 w-full object-cover"
        loading="lazy"
      />
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="font-semibold">{p.full_name}</div>
          {p.verified && (
            <span className="text-xs rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">
              Verified
            </span>
          )}
        </div>
        <div className="text-sm text-zinc-600">{p.city} · od {p.price_from_pln} PLN</div>
        <RatingStars value={p.rating_avg} count={p.rating_count} />
        <div className="pt-2 flex gap-2">
          <Link
            to={`/photographer/${p.id}`}
            className="px-3 py-2 rounded-lg border hover:bg-zinc-50 text-sm"
          >
            Zobacz profil
          </Link>
          <Link
            to={`/booking?photographerId=${p.id}`}
            className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            Rezerwuj
          </Link>
        </div>
      </div>
    </div>
  );
}
