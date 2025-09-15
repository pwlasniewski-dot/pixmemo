// Prosty mock backendu dla panelu Admina (localStorage).
// Przechowuje: fotografów do weryfikacji + rezerwacje.

export type AdminPhotographer = {
  id: string;
  full_name: string;
  city: string;
  portfolio_count: number;
  verified: boolean;           // czy jest widoczny publicznie
  status: "submitted" | "under_review" | "approved" | "rejected";
  submitted_at: string;        // ISO
};

export type AdminBooking = {
  id: string;
  client_name: string;
  client_email: string;
  photographer_name: string;
  package_name: string;
  date: string;                // YYYY-MM-DD
  time: string;                // HH:MM
  price_pln: number;
  status: "pending" | "awaiting_payment" | "confirmed" | "done" | "cancelled";
  payment_provider: "stripe" | "p24" | "none";
  created_at: string;          // ISO
};

export type AdminState = {
  photographers: AdminPhotographer[];
  bookings: AdminBooking[];
  last_updated: string;
};

const KEY = "pm_mock_admin";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Seed DEMO (jeśli nic nie ma)
const DEFAULT: AdminState = {
  photographers: [
    {
      id: "ph-sub-1",
      full_name: "Katarzyna Zielińska",
      city: "Chełmża",
      portfolio_count: 9,
      verified: false,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    },
    {
      id: "ph-under-1",
      full_name: "Michał Wiśniewski",
      city: "Bydgoszcz",
      portfolio_count: 12,
      verified: false,
      status: "under_review",
      submitted_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "ph-ok-1",
      full_name: "Jan Kowalski",
      city: "Toruń",
      portfolio_count: 15,
      verified: true,
      status: "approved",
      submitted_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ],
  bookings: [
    {
      id: "bk-1",
      client_name: "Anna K.",
      client_email: "anna@example.com",
      photographer_name: "Jan Kowalski",
      package_name: "Złoty",
      date: new Date().toISOString().slice(0, 10),
      time: "12:00",
      price_pln: 700,
      status: "confirmed",
      payment_provider: "stripe",
      created_at: new Date(Date.now() - 3600_000).toISOString(),
    },
    {
      id: "bk-2",
      client_name: "Piotr M.",
      client_email: "piotr@example.com",
      photographer_name: "Jan Kowalski",
      package_name: "Ekonomiczny",
      date: new Date().toISOString().slice(0, 10),
      time: "17:30",
      price_pln: 400,
      status: "awaiting_payment",
      payment_provider: "p24",
      created_at: new Date(Date.now() - 7200_000).toISOString(),
    },
    {
      id: "bk-3",
      client_name: "Zuzanna P.",
      client_email: "zuzanna@example.com",
      photographer_name: "Anna Nowak",
      package_name: "Ekonomiczny",
      date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      time: "10:00",
      price_pln: 500,
      status: "pending",
      payment_provider: "none",
      created_at: new Date(Date.now() - 10800_000).toISOString(),
    },
  ],
  last_updated: new Date().toISOString(),
};

// --- helpers ---
export function loadAdmin(): AdminState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as AdminState;
  } catch {}
  localStorage.setItem(KEY, JSON.stringify(DEFAULT));
  return DEFAULT;
}

function saveAdmin(state: AdminState) {
  state.last_updated = new Date().toISOString();
  localStorage.setItem(KEY, JSON.stringify(state));
}

// --- API: Fotografowie ---
export function listPhotographers(status?: AdminPhotographer["status"]) {
  const s = loadAdmin();
  return status ? s.photographers.filter((p) => p.status === status) : s.photographers;
}

export function approvePhotographer(id: string) {
  const s = loadAdmin();
  s.photographers = s.photographers.map((p) =>
    p.id === id ? { ...p, status: "approved", verified: true } : p
  );
  saveAdmin(s);
  return s.photographers;
}

export function rejectPhotographer(id: string) {
  const s = loadAdmin();
  s.photographers = s.photographers.map((p) =>
    p.id === id ? { ...p, status: "rejected", verified: false } : p
  );
  saveAdmin(s);
  return s.photographers;
}

export function startReviewPhotographer(id: string) {
  const s = loadAdmin();
  s.photographers = s.photographers.map((p) =>
    p.id === id ? { ...p, status: "under_review" } : p
  );
  saveAdmin(s);
  return s.photographers;
}

export function createMockPhotographer(payload: Omit<AdminPhotographer, "id" | "submitted_at">) {
  const s = loadAdmin();
  s.photographers.unshift({
    id: uid(),
    submitted_at: new Date().toISOString(),
    ...payload,
  });
  saveAdmin(s);
  return s.photographers;
}

// --- API: Rezerwacje ---
export function listBookings(status?: AdminBooking["status"]) {
  const s = loadAdmin();
  return status ? s.bookings.filter((b) => b.status === status) : s.bookings;
}

export function updateBookingStatus(id: string, status: AdminBooking["status"]) {
  const s = loadAdmin();
  s.bookings = s.bookings.map((b) => (b.id === id ? { ...b, status } : b));
  saveAdmin(s);
  return s.bookings;
}

export function createMockBooking(b: Omit<AdminBooking, "id" | "created_at">) {
  const s = loadAdmin();
  s.bookings.unshift({
    id: uid(),
    created_at: new Date().toISOString(),
    ...b,
  });
  saveAdmin(s);
  return s.bookings;
}

export function resetAdminDemo() {
  saveAdmin(DEFAULT);
  return loadAdmin();
}
