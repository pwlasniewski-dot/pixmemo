import { useState } from "react";
import { addReview } from "@/api/mock_reviews";

export default function ReviewForm({ photographerId, onAdded }:{
  photographerId: string; onAdded: () => void;
}) {
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return alert("Dodaj krótki komentarz.");
    addReview({ photographerId, author: author.trim() || "Gość", rating, comment: comment.trim() });
    setAuthor(""); setRating(5); setComment(""); onAdded();
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input className="px-3 py-2 rounded-lg border" placeholder="Imię (opcjonalnie)"
          value={author} onChange={(e)=>setAuthor(e.target.value)} />
        <select className="px-3 py-2 rounded-lg border" value={rating}
          onChange={(e)=>setRating(Number(e.target.value))}>
          {[5,4,3,2,1].map(n=> <option key={n} value={n}>{n} ★</option>)}
        </select>
      </div>
      <textarea className="w-full px-3 py-2 rounded-lg border min-h-[90px]"
        placeholder="Napisz kilka słów o sesji…" value={comment} onChange={(e)=>setComment(e.target.value)} />
      <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
        Dodaj opinię
      </button>
    </form>
  );
}
