// src/api/client.ts
// Helpery do komunikacji z backendem (MVP/dev-friendly)

const API = import.meta.env.VITE_API_URL || "http://localhost:5174";

// ==== Typy (luźne, żeby nie blokować pracy) ====
export type Photographer = {
  id: string;
  full_name?: string;
  city?: string;
  price_from_pln?: number;
  rating_avg?: number;
  rating_count?: number;
  primary_photo_url?: string;
};

export type PhotographerQuery = { city?: string; date?: string };

export type Booking = {
  id: string;
  clientEmail: string;
  photographerId: string;
  packageId: string;
  date: string;  // yyyy-mm-dd
  time: string;  // HH:mm
  address: { street: string; postal: string; city: string };
  priceFinalPln: number;
  status: "pending" | "awaiting_payment" | "confirmed" | "done" | "cancelled";
  trackToken?: string;
};

// ==== Fotografowie (public) ====
export async function getPhotographers(q: PhotographerQuery): Promise<Photographer[]> {
  const qs = new URLSearchParams();
  if (q.city) qs.set("city", q.city);
  if (q.date) qs.set("date", q.date);
  const r = await fetch(`${API}/photographers?${qs.toString()}`);
  if (!r.ok) throw new Error("Nie udało się pobrać fotografów");
  return r.json();
}

export async function getPhotographer(id: string): Promise<Photographer> {
  const r = await fetch(`${API}/photographers/${encodeURIComponent(id)}`);
  if (!r.ok) throw new Error("Nie udało się pobrać profilu fotografa");
  return r.json();
}

// ==== Rezerwacje (klient) ====
export async function createBooking(payload: {
  clientEmail: string;
  photographer_id: string;
  package_id: string;
  date: string;
  time: string;
  address: { street: string; postal: string; city: string };
  price_final_pln: number;
}) {
  const r = await fetch(`${API}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`Booking failed: ${r.status}`);
  // { booking_id, status, track_token }
  return r.json() as Promise<{ booking_id: string; status: string; track_token?: string }>;
}

export async function getClientBookings(email: string): Promise<Booking[]> {
  const r = await fetch(`${API}/client/bookings?email=${encodeURIComponent(email)}`);
  if (!r.ok) throw new Error("Nie udało się pobrać rezerwacji klienta");
  return r.json();
}

// ==== Rezerwacje (fotograf) ====
export async function getPhotographerBookings(photographerId: string): Promise<Booking[]> {
  const r = await fetch(`${API}/photographer/bookings?photographerId=${encodeURIComponent(photographerId)}`);
  if (!r.ok) throw new Error("Nie udało się pobrać rezerwacji fotografa");
  return r.json();
}

// ==== LIVE (mapa) ====
export async function postLiveLocation(token: string, lat: number, lng: number) {
  const r = await fetch(`${API}/live/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng }),
  });
  if (!r.ok) throw new Error("Live location post failed");
  return r.json();
}

export async function getLiveOnce(token: string) {
  const r = await fetch(`${API}/live/${token}`);
  if (!r.ok) throw new Error("Live location read failed");
  return r.json() as Promise<{ lat: number; lng: number; ts: number } | null>;
}

export function subscribeLiveSSE(token: string, onData: (pos: any) => void) {
  const url = `${API}/live/${token}/stream`;
  const es = new EventSource(url);
  es.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      onData(data);
    } catch {
      // ignore parse errors
    }
  };
  return () => es.close();
}
