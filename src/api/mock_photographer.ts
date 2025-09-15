// Prosty storage w localStorage – symuluje backend dla panelu fotografa.

export type Pkg = { id: string; name: string; price_pln: number; description?: string };
export type DaySlots = { date: string; slots: string[] };
export type PhotographerProfile = {
  id: string;
  full_name: string;
  city: string;
  bio: string;
  primary_photo_url: string;
  verified: boolean;
  packages: Pkg[];
  availability: DaySlots[];
};

const KEY = "pm_mock_me_photographer";

// startowe dane demo (jeśli brak w storage)
const DEFAULT: PhotographerProfile = {
  id: "me-demo-uuid",
  full_name: "Jan Kowalski",
  city: "Toruń",
  bio: "Fotograf rodzinny i ślubny. Naturalne światło, ciepłe kolory.",
  primary_photo_url: "https://images.unsplash.com/photo-1519340241587-8ef61a9e169f?w=1200",
  verified: true,
  packages: [
    { id: "pk1", name: "Ekonomiczny", price_pln: 400, description: "30 min, 10 ujęć" },
    { id: "pk2", name: "Złoty", price_pln: 700, description: "60 min, 25 ujęć" },
  ],
  availability: [
    { date: new Date().toISOString().slice(0, 10), slots: ["10:00", "12:00", "17:30"] },
  ],
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function loadMe(): PhotographerProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as PhotographerProfile;
  } catch {}
  localStorage.setItem(KEY, JSON.stringify(DEFAULT));
  return DEFAULT;
}

export function saveMe(p: PhotographerProfile) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function upsertPackage(pkg: Omit<Pkg, "id"> & { id?: string }) {
  const me = loadMe();
  if (!pkg.id) {
    me.packages.push({ ...pkg, id: uid() });
  } else {
    me.packages = me.packages.map((x) => (x.id === pkg.id ? (pkg as Pkg) : x));
  }
  saveMe(me);
  return me.packages;
}

export function deletePackage(id: string) {
  const me = loadMe();
  me.packages = me.packages.filter((x) => x.id !== id);
  saveMe(me);
  return me.packages;
}

export function setDaySlots(date: string, slots: string[]) {
  const me = loadMe();
  const idx = me.availability.findIndex((d) => d.date === date);
  if (idx >= 0) me.availability[idx].slots = slots;
  else me.availability.push({ date, slots });
  saveMe(me);
  return me.availability;
}

export function deleteDay(date: string) {
  const me = loadMe();
  me.availability = me.availability.filter((d) => d.date !== date);
  saveMe(me);
  return me.availability;
}

export function updateProfile(patch: Partial<PhotographerProfile>) {
  const me = loadMe();
  const next = { ...me, ...patch };
  // nie pozwalamy nadpisać tablic, jeśli nie przychodzą:
  if (!patch.packages) next.packages = me.packages;
  if (!patch.availability) next.availability = me.availability;
  saveMe(next);
  return next;
}
