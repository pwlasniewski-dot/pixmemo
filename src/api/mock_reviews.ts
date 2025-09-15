export type Review = {
  id: string;
  photographerId: string;
  author: string;
  rating: number; // 1..5
  comment: string;
  created_at: string; // ISO
};

const KEY = "pm_reviews";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function readAll(): Review[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Review[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: Review[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function listReviews(photographerId: string) {
  return readAll().filter((r) => r.photographerId === photographerId);
}

export function addReview(input: Omit<Review, "id" | "created_at">) {
  const all = readAll();
  const rev: Review = {
    id: uid(),
    created_at: new Date().toISOString(),
    ...input,
  };
  all.unshift(rev);
  writeAll(all);
  return rev;
}

export function getAvgRating(photographerId: string) {
  const rs = listReviews(photographerId);
  if (rs.length === 0) return { avg: 0, count: 0 };
  const sum = rs.reduce((a, b) => a + b.rating, 0);
  return { avg: Math.round((sum / rs.length) * 10) / 10, count: rs.length };
}
