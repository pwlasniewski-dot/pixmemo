import { Review } from "@/api/mock_reviews";

export default function ReviewsList({ items }: { items: Review[] }) {
  if (items.length === 0) return <p className="text-sm text-zinc-500">Brak opinii — bądź pierwszy!</p>;
  return (
    <ul className="space-y-3">
      {items.map(r => (
        <li key={r.id} className="rounded-xl border p-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">{r.author || "Gość"}</div>
            <div className="text-amber-500 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</div>
          </div>
          <p className="text-sm text-zinc-700 mt-1">{r.comment}</p>
          <div className="text-xs text-zinc-500 mt-1">{new Date(r.created_at).toLocaleString()}</div>
        </li>
      ))}
    </ul>
  );
}
