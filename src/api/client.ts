import type { Photographer } from "../types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Demo-dane
const PHOTOGRAPHERS: Photographer[] = [
  {
    id: "p1",
    full_name: "Jan Kowalski",
    city: "Toruń",
    rating_avg: 4.9,
    rating_count: 12,
    primary_photo_url: "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=800",
    price_from_pln: 400,
    verified: true,
    packages: [
      { id: "pk1", name: "Ekonomiczny", price_pln: 400 },
      { id: "pk2", name: "Złoty", price_pln: 700 },
      { id: "pk3", name: "Platynowy", price_pln: 1200 },
    ],
  },
  {
    id: "p2",
    full_name: "Anna Nowak",
    city: "Wąbrzeźno",
    rating_avg: 5.0,
    rating_count: 8,
    primary_photo_url: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=800",
    price_from_pln: 500,
    verified: true,
    packages: [
      { id: "pk4", name: "Ekonomiczny", price_pln: 500 },
      { id: "pk5", name: "Złoty", price_pln: 800 },
    ],
  },
];

export async function getPhotographers(params?: {
  city?: string;
  date?: string; // na przyszłość
}): Promise<Photographer[]> {
  await delay(300);
  let list = [...PHOTOGRAPHERS];
  if (params?.city) {
    const q = params.city.toLowerCase();
    list = list.filter((p) => p.city.toLowerCase().includes(q));
  }
  return list;
}

export async function getPhotographer(id: string): Promise<Photographer | null> {
  await delay(200);
  return PHOTOGRAPHERS.find((p) => p.id === id) ?? null;
}
