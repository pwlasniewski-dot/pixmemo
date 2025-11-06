// server/index.cjs
const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");

const app = express();
app.use(cors({ origin: ["http://localhost:5173"], credentials: false }));
app.use(express.json());

// --- DEMO USERS/AUTH ---
const users = [
  { id: "u-ph-1", email: "fotograf@pixmemo.pl", role: "photographer", password: "demo123", profileId: "p1" },
  { id: "u-ad-1", email: "admin@pixmemo.pl", role: "admin", password: "demo123" },
  { id: "u-cl-1", email: "klient@pixmemo.pl", role: "client", password: "demo123" },
];
const tokens = new Map(); // token -> userId

function issueToken(userId) {
  const token = randomUUID();
  tokens.set(token, userId);
  return token;
}

function getUserFromToken(req) {
  const header = req.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token || !tokens.has(token)) return null;
  const user = users.find((u) => u.id === tokens.get(token));
  if (!user) return null;
  return { token, user };
}

function requireAuth(req, res, next) {
  const auth = getUserFromToken(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });
  req.auth = auth;
  next();
}

function requirePhotographer(req, res, next) {
  requireAuth(req, res, () => {
    if (req.auth.user.role !== "photographer") {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  });
}

// --- MOCK: fotografowie ---
const photographerProfiles = new Map([
  [
    "p1",
    {
      id: "p1",
      userId: "u-ph-1",
      full_name: "Jan Kowalski",
      city: "Toruń",
      price_from_pln: 300,
      rating_avg: 4.8,
      rating_count: 23,
      primary_photo_url: "/demo/p1.jpg",
      verified: true,
      short_bio: "Portrety rodzinne i reportaże ślubne z ciepłym światłem.",
      bio: "Nazywam się Jan i od 8 lat fotografuję rodziny oraz śluby. Stawiam na naturalne światło i autentyczne emocje.",
      languages: ["pl", "en"],
      travel_km: 80,
      packages: [
        { id: "pk1", name: "Mini", price_pln: 350, description: "30 min, 10 ujęć" },
        { id: "pk2", name: "Classic", price_pln: 600, description: "60 min, 25 ujęć" },
        { id: "pk3", name: "Premium", price_pln: 900, description: "120 min, 50 ujęć" },
      ],
      availability: [
        { date: new Date().toISOString().slice(0, 10), slots: ["10:00", "12:00", "17:30"] },
        { date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), slots: ["09:00", "13:30"] },
      ],
    },
  ],
  [
    "p2",
    {
      id: "p2",
      full_name: "Anna Nowak",
      city: "Grudziądz",
      price_from_pln: 250,
      rating_avg: 4.6,
      rating_count: 12,
      primary_photo_url: "/demo/p2.jpg",
      verified: true,
      short_bio: "Lifestyle i fotografia rodzinna w naturalnych kadrach.",
      bio: "Anna to fotografka lifestyle z doświadczeniem w pracy z dziećmi. Tworzy ciepłe i przyjazne kadry.",
      languages: ["pl"],
      travel_km: 50,
      packages: [
        { id: "pk4", name: "Standard", price_pln: 400, description: "45 min, 15 ujęć" },
        { id: "pk5", name: "Rodzinny", price_pln: 650, description: "75 min, 30 ujęć" },
      ],
      availability: [
        { date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10), slots: ["11:00", "16:00"] },
      ],
    },
  ],
  [
    "p3",
    {
      id: "p3",
      full_name: "Piotr Zieliński",
      city: "Wąbrzeźno",
      price_from_pln: 280,
      rating_avg: 4.7,
      rating_count: 17,
      primary_photo_url: "/demo/p3.jpg",
      verified: false,
      short_bio: "Plenery i fotografia narzeczeńska.",
      bio: "Sesje plenerowe w warmińskich lasach i nad jeziorami. Fotografia narzeczeńska i rodzinne spacery.",
      languages: ["pl"],
      travel_km: 40,
      packages: [
        { id: "pk6", name: "Sesja plenerowa", price_pln: 450, description: "60 min, 20 ujęć" },
      ],
      availability: [],
    },
  ],
]);

function listPhotographers() {
  return Array.from(photographerProfiles.values()).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    city: p.city,
    price_from_pln: p.price_from_pln,
    rating_avg: p.rating_avg,
    rating_count: p.rating_count,
    primary_photo_url: p.primary_photo_url,
    verified: p.verified,
    short_bio: p.short_bio,
  }));
}

function recalcPriceFromPackages(profile) {
  if (!profile.packages || profile.packages.length === 0) {
    profile.price_from_pln = 0;
    return;
  }
  profile.price_from_pln = profile.packages.reduce(
    (min, pkg) => Math.min(min, Number(pkg.price_pln || min)),
    profile.packages[0]?.price_pln || profile.price_from_pln || 0
  );
}

// --- Auth endpoints ---
app.post("/auth/login", (req, res) => {
  const { email, password, role } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email i hasło są wymagane" });
  }
  const user = users.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase() && (!role || u.role === role)
  );
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Nieprawidłowe dane logowania" });
  }
  const token = issueToken(user.id);
  res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role, profileId: user.profileId },
  });
});

app.get("/auth/me", (req, res) => {
  const auth = getUserFromToken(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });
  const { user, token } = auth;
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, profileId: user.profileId } });
});

app.post("/auth/logout", (req, res) => {
  const auth = getUserFromToken(req);
  if (!auth) return res.status(204).end();
  tokens.delete(auth.token);
  res.status(204).end();
});

app.get("/photographers", (req, res) => {
  const city = String(req.query.city || "").toLowerCase();
  const date = String(req.query.date || "");
  let list = listPhotographers();
  if (city) list = list.filter((p) => (p.city || "").toLowerCase().includes(city));
  if (date) {
    list = list.filter((p) => {
      const full = photographerProfiles.get(p.id);
      if (!full?.availability) return false;
      return full.availability.some((d) => d.date === date && d.slots.length > 0);
    });
  }
  res.json(list);
});

app.get("/photographers/:id", (req, res) => {
  const { id } = req.params;
  const profile = photographerProfiles.get(id);
  if (!profile) return res.status(404).json({ error: "Not found" });
  res.json({ ...profile });
});

// --- Dashboard: photographer profile management ---
app.get("/dashboard/photographer/me", requirePhotographer, (req, res) => {
  const profileId = req.auth.user.profileId;
  const profile = profileId ? photographerProfiles.get(profileId) : null;
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  res.json({ ...profile });
});

app.put("/dashboard/photographer/me", requirePhotographer, (req, res) => {
  const profileId = req.auth.user.profileId;
  const profile = profileId ? photographerProfiles.get(profileId) : null;
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  const { full_name, city, bio, primary_photo_url } = req.body || {};
  if (typeof full_name === "string" && full_name.trim()) profile.full_name = full_name.trim();
  if (typeof city === "string" && city.trim()) profile.city = city.trim();
  if (typeof bio === "string") {
    profile.bio = bio;
    profile.short_bio = bio.length > 140 ? `${bio.slice(0, 137)}...` : bio;
  }
  if (typeof primary_photo_url === "string" && primary_photo_url.trim()) {
    profile.primary_photo_url = primary_photo_url.trim();
  }
  photographerProfiles.set(profile.id, profile);
  res.json({ ...profile });
});

app.post("/dashboard/photographer/packages", requirePhotographer, (req, res) => {
  const profileId = req.auth.user.profileId;
  const profile = profileId ? photographerProfiles.get(profileId) : null;
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  const { id, name, price_pln, description } = req.body || {};
  if (!name || !price_pln) return res.status(400).json({ error: "Nazwa i cena są wymagane" });
  const payload = {
    id: id || randomUUID(),
    name: String(name),
    price_pln: Number(price_pln),
    description: description ? String(description) : undefined,
  };
  const existingIndex = profile.packages.findIndex((p) => p.id === payload.id);
  if (existingIndex >= 0) profile.packages[existingIndex] = payload;
  else profile.packages.push(payload);
  recalcPriceFromPackages(profile);
  photographerProfiles.set(profile.id, profile);
  res.json(profile.packages);
});

app.delete("/dashboard/photographer/packages/:id", requirePhotographer, (req, res) => {
  const profileId = req.auth.user.profileId;
  const profile = profileId ? photographerProfiles.get(profileId) : null;
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  const { id } = req.params;
  profile.packages = profile.packages.filter((p) => p.id !== id);
  recalcPriceFromPackages(profile);
  photographerProfiles.set(profile.id, profile);
  res.json(profile.packages);
});

app.put("/dashboard/photographer/availability/:date", requirePhotographer, (req, res) => {
  const profileId = req.auth.user.profileId;
  const profile = profileId ? photographerProfiles.get(profileId) : null;
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  const { date } = req.params;
  const { slots } = req.body || {};
  if (!Array.isArray(slots)) return res.status(400).json({ error: "Slots must be an array" });
  const sanitized = slots
    .filter((s) => typeof s === "string")
    .map((s) => s.trim())
    .filter(Boolean)
    .sort();
  const idx = profile.availability.findIndex((d) => d.date === date);
  if (idx >= 0) profile.availability[idx].slots = sanitized;
  else profile.availability.push({ date, slots: sanitized });
  profile.availability.sort((a, b) => a.date.localeCompare(b.date));
  photographerProfiles.set(profile.id, profile);
  res.json(profile.availability);
});

app.delete("/dashboard/photographer/availability/:date", requirePhotographer, (req, res) => {
  const profileId = req.auth.user.profileId;
  const profile = profileId ? photographerProfiles.get(profileId) : null;
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  const { date } = req.params;
  profile.availability = profile.availability.filter((d) => d.date !== date);
  photographerProfiles.set(profile.id, profile);
  res.json(profile.availability);
});

// --- Rezerwacje (in-memory) ---
const bookings = new Map();
const livePos  = new Map();

function serializeBooking(b) {
  return {
    id: b.id,
    clientEmail: b.clientEmail,
    photographerId: b.photographerId,
    packageId: b.packageId,
    date: b.date,
    time: b.time,
    address: b.address,
    priceFinalPln: b.priceFinalPln,
    status: b.status,
    trackToken: b.trackToken,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

app.post("/bookings", (req, res) => {
  const { clientEmail, photographer_id, package_id, date, time, address, price_final_pln } = req.body || {};
  if (!photographer_id || !package_id || !date || !time) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const id = randomUUID();
  const trackToken = randomUUID();
  const now = new Date().toISOString();
  const b = {
    id,
    clientEmail: clientEmail || "client@example.com",
    photographerId: String(photographer_id),
    packageId: String(package_id),
    date,
    time,
    address: address || { street: "", postal: "", city: "" },
    priceFinalPln: Number(price_final_pln ?? 0),
    status: "awaiting_payment",
    trackToken,
    createdAt: now,
    updatedAt: now,
  };
  bookings.set(id, b);
  res.status(201).json({ booking_id: id, status: b.status, track_token: trackToken });
});

app.get("/bookings/:id", (req, res) => {
  const { id } = req.params;
  const booking = bookings.get(id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  res.json(serializeBooking(booking));
});

app.patch("/bookings/:id/status", (req, res) => {
  const { id } = req.params;
  const booking = bookings.get(id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: "Status required" });
  booking.status = status;
  booking.updatedAt = new Date().toISOString();
  bookings.set(id, booking);
  res.json(serializeBooking(booking));
});

app.get("/photographer/bookings", (req, res) => {
  const pid = String(req.query.photographerId || "");
  res.json(
    Array.from(bookings.values())
      .filter((b) => b.photographerId === pid)
      .map((b) => serializeBooking(b))
  );
});

app.get("/client/bookings", (req, res) => {
  const email = String(req.query.email || "").toLowerCase();
  res.json(
    Array.from(bookings.values())
      .filter((b) => (b.clientEmail || "").toLowerCase() === email)
      .map((b) => serializeBooking(b))
  );
});

// --- Payments (demo sessions) ---
app.post("/payments/stripe/session", (req, res) => {
  const { booking_id, amount_pln, success_url, cancel_url } = req.body || {};
  if (!booking_id || typeof amount_pln !== "number") {
    return res.status(400).json({ error: "booking_id i amount_pln są wymagane" });
  }
  if (!bookings.has(booking_id)) {
    return res.status(404).json({ error: "Booking not found" });
  }
  const sessionId = randomUUID();
  const redirect = success_url || `${process.env.FRONTEND_URL || "http://localhost:5173/pixmemo"}/payment/success`;
  res.json({ session_id: sessionId, redirect_url: redirect, amount_pln, cancel_url: cancel_url || null });
});

app.post("/payments/p24/session", (req, res) => {
  const { booking_id, amount_pln, success_url } = req.body || {};
  if (!booking_id || typeof amount_pln !== "number") {
    return res.status(400).json({ error: "booking_id i amount_pln są wymagane" });
  }
  if (!bookings.has(booking_id)) {
    return res.status(404).json({ error: "Booking not found" });
  }
  const redirect = success_url || `${process.env.FRONTEND_URL || "http://localhost:5173/pixmemo"}/payment/success`;
  res.json({ redirect_url: redirect, token: randomUUID(), amount_pln });
});

// --- LIVE ---
app.post("/live/:token", (req, res) => {
  const { token } = req.params;
  const { lat, lng } = req.body || {};
  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ error: "lat/lng required" });
  }
  livePos.set(token, { lat, lng, ts: Date.now() });
  res.json({ ok: true });
});

app.get("/live/:token", (req, res) => {
  const { token } = req.params;
  res.json(livePos.get(token) || null);
});

app.get("/live/:token/stream", (req, res) => {
  const { token } = req.params;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  res.write(`data: ${JSON.stringify(livePos.get(token) || null)}\n\n`);
  const intv = setInterval(() => {
    res.write(`data: ${JSON.stringify(livePos.get(token) || null)}\n\n`);
  }, 2000);
  req.on("close", () => clearInterval(intv));
});

// --- Health ---
app.get("/healthz", (_req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT || 5174);
app.listen(port, () => console.log(`API on http://localhost:${port}`));
