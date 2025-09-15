// server/index.cjs
const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");

const app = express();
app.use(cors({ origin: ["http://localhost:5173"], credentials: false }));
app.use(express.json());

// --- MOCK: fotografowie ---
const photographers = [
  { id: "p1", full_name: "Jan Kowalski", city: "Toruń",     price_from_pln: 300, rating_avg: 4.8, rating_count: 23, primary_photo_url: "/demo/p1.jpg" },
  { id: "p2", full_name: "Anna Nowak",   city: "Grudziądz", price_from_pln: 250, rating_avg: 4.6, rating_count: 12, primary_photo_url: "/demo/p2.jpg" },
  { id: "p3", full_name: "Piotr Zieliński", city: "Wąbrzeźno", price_from_pln: 280, rating_avg: 4.7, rating_count: 17, primary_photo_url: "/demo/p3.jpg" }
];

app.get("/photographers", (req, res) => {
  const city = String(req.query.city || "").toLowerCase();
  let list = photographers;
  if (city) list = list.filter(p => (p.city || "").toLowerCase().includes(city));
  res.json(list);
});

// --- Rezerwacje (in-memory) ---
const bookings = new Map();
const livePos  = new Map();

app.post("/bookings", (req, res) => {
  const { clientEmail, photographer_id, package_id, date, time, address, price_final_pln } = req.body || {};
  if (!photographer_id || !package_id || !date || !time) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const id = randomUUID();
  const trackToken = randomUUID();
  const b = {
    id,
    clientEmail: clientEmail || "client@example.com",
    photographerId: String(photographer_id),
    packageId: String(package_id),
    date, time,
    address: address || { street: "", postal: "", city: "" },
    priceFinalPln: Number(price_final_pln ?? 0),
    status: "confirmed",   // DEV: od razu confirmed
    trackToken
  };
  bookings.set(id, b);
  res.status(201).json({ booking_id: id, status: b.status, track_token: trackToken });
});

app.get("/photographer/bookings", (req, res) => {
  const pid = String(req.query.photographerId || "");
  res.json(Array.from(bookings.values()).filter(b => b.photographerId === pid));
});

app.get("/client/bookings", (req, res) => {
  const email = String(req.query.email || "").toLowerCase();
  res.json(Array.from(bookings.values()).filter(b => (b.clientEmail || "").toLowerCase() === email));
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
