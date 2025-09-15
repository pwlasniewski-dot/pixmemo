export type BookingDraft = {
  photographerId: string;
  photographerName: string;
  pkgId: string;
  pkgName: string;
  date: string;
  slot: string;
  address: { street: string; postal: string; city: string };
  distanceKm: number;
  discountPct: number;
  price: { base: number; travel: number; total: number };
};

const KEY = "pm_booking";

export function saveDraft(d: BookingDraft) {
  localStorage.setItem(KEY, JSON.stringify(d));
}

export function readDraft(): BookingDraft | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BookingDraft) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  localStorage.removeItem(KEY);
}
