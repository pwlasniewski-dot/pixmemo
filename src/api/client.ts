// src/api/client.ts
// Helpery do komunikacji z backendem (MVP/dev-friendly)

import type { Photographer } from "@/types";

const API = import.meta.env.VITE_API_URL || "http://localhost:5174";

export type PhotographerQuery = { city?: string; date?: string };

export type BookingStatus = "pending" | "awaiting_payment" | "confirmed" | "done" | "cancelled";

export type Booking = {
  id: string;
  clientEmail: string;
  photographerId: string;
  packageId: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  address: { street: string; postal: string; city: string };
  priceFinalPln: number;
  status: BookingStatus;
  trackToken?: string;
  createdAt?: string;
  updatedAt?: string;
};

type HttpOptions = RequestInit & { timeoutMs?: number };

async function http<T>(path: string, { timeoutMs = 8000, ...init }: HttpOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(path, { ...init, signal: controller.signal });
    if (!res.ok) {
      let message = `Błąd (${res.status})`;
      try {
        const data = await res.json();
        if (data?.error) message = data.error;
      } catch {}
      throw new Error(message);
    }
    return res.json() as Promise<T>;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Przekroczono limit czasu połączenia");
    }
    if (error instanceof TypeError) {
      throw new Error("Błąd sieci – sprawdź połączenie");
    }
    throw error as Error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildUrl(path: string) {
  return `${API}${path}`;
}

// ==== Fotografowie (public) ====
export async function getPhotographers(q: PhotographerQuery = {}): Promise<Photographer[]> {
  const qs = new URLSearchParams();
  if (q.city) qs.set("city", q.city);
  if (q.date) qs.set("date", q.date);
  const suffix = qs.toString();
  return http<Photographer[]>(buildUrl(`/photographers${suffix ? `?${suffix}` : ""}`));
}

export async function getPhotographer(id: string): Promise<Photographer> {
  return http<Photographer>(buildUrl(`/photographers/${encodeURIComponent(id)}`));
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
}): Promise<{ booking_id: string; status: string; track_token?: string }> {
  return http(buildUrl("/bookings"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getBooking(id: string): Promise<Booking> {
  return http<Booking>(buildUrl(`/bookings/${encodeURIComponent(id)}`));
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
  return http<Booking>(buildUrl(`/bookings/${encodeURIComponent(id)}/status`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export async function getClientBookings(email: string): Promise<Booking[]> {
  return http<Booking[]>(buildUrl(`/client/bookings?email=${encodeURIComponent(email)}`));
}

// ==== Rezerwacje (fotograf) ====
export async function getPhotographerBookings(photographerId: string): Promise<Booking[]> {
  return http<Booking[]>(
    buildUrl(`/photographer/bookings?photographerId=${encodeURIComponent(photographerId)}`)
  );
}

// ==== LIVE (mapa) ====
export async function postLiveLocation(token: string, lat: number, lng: number) {
  return http(buildUrl(`/live/${token}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng }),
  });
}

export async function getLiveOnce(token: string) {
  return http<{ lat: number; lng: number; ts: number } | null>(buildUrl(`/live/${token}`));
}

export function subscribeLiveSSE(token: string, onData: (pos: any) => void) {
  const url = buildUrl(`/live/${token}/stream`);
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
