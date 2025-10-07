import http from "http";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { photographers, findPhotographer, getAvailability } from "./data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_DIR = path.join(__dirname, "storage");
const BOOKINGS_FILE = path.join(STORAGE_DIR, "bookings.json");
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function ensureStorageFile() {
  await mkdir(STORAGE_DIR, { recursive: true });
  try {
    await readFile(BOOKINGS_FILE, "utf-8");
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeFile(BOOKINGS_FILE, JSON.stringify([]), "utf-8");
    } else {
      throw error;
    }
  }
}

async function readBookings() {
  await ensureStorageFile();
  const raw = await readFile(BOOKINGS_FILE, "utf-8");
  return JSON.parse(raw);
}

async function writeBookings(bookings) {
  await ensureStorageFile();
  await writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), "utf-8");
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.connection.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        const json = JSON.parse(body);
        resolve(json);
      } catch (err) {
        reject(new Error("Invalid JSON payload"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, payload) {
  const data = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(data);
}

function handleOptions(req, res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end();
}

function validateBooking(payload) {
  const required = [
    "clientEmail",
    "photographerId",
    "packageId",
    "date",
    "time",
    "addressStreet",
    "addressCity",
    "addressPostal",
  ];

  for (const field of required) {
    if (!payload[field] || typeof payload[field] !== "string") {
      return { valid: false, reason: `Brak pola: ${field}` };
    }
  }

  const { photographerId, date, time } = payload;
  const availability = getAvailability(photographerId);
  if (!availability) {
    return { valid: false, reason: "Wybrany fotograf nie istnieje." };
  }

  if (!availability[date] || !availability[date].includes(time)) {
    return {
      valid: false,
      reason: "Termin niedostępny — wybierz godzinę z kalendarza fotografa.",
    };
  }

  return { valid: true };
}

function createBooking(payload) {
  const now = new Date().toISOString();
  return {
    id: `bk-${Math.random().toString(36).slice(2, 10)}`,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    clientEmail: payload.clientEmail,
    photographerId: payload.photographerId,
    packageId: payload.packageId,
    date: payload.date,
    time: payload.time,
    addressStreet: payload.addressStreet,
    addressCity: payload.addressCity,
    addressPostal: payload.addressPostal,
    travelNotes: payload.travelNotes ?? "",
    paymentMethod: payload.paymentMethod ?? "stripe",
    priceSummary: payload.priceSummary ?? null,
  };
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 400, { error: "Invalid request" });
    return;
  }

  const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    handleOptions(req, res);
    return;
  }

  if (pathname === "/api/healthz" && req.method === "GET") {
    sendJson(res, 200, { status: "ok", timestamp: new Date().toISOString() });
    return;
  }

  if (pathname === "/api/photographers" && req.method === "GET") {
    const city = searchParams.get("city");
    const data = city
      ? photographers.filter((p) => p.city.toLowerCase() === city.toLowerCase())
      : photographers;
    sendJson(res, 200, data.map((p) => ({
      id: p.id,
      fullName: p.fullName,
      city: p.city,
      bio: p.bio,
      rating: p.rating,
      reviewCount: p.reviewCount,
      verificationLevel: p.verificationLevel,
      heroImage: p.heroImage,
      specialties: p.specialties,
      packages: p.packages,
    })));
    return;
  }

  const photographerMatch = pathname.match(/^\/api\/photographers\/(.+)$/);
  if (photographerMatch && req.method === "GET") {
    const [_, slug] = photographerMatch;
    const parts = slug.split("/").filter(Boolean);
    const photographerId = parts[0];
    const subresource = parts[1];
    const photographer = findPhotographer(photographerId);
    if (!photographer) {
      sendJson(res, 404, { error: "Nie znaleziono fotografa." });
      return;
    }

    if (!subresource) {
      sendJson(res, 200, photographer);
      return;
    }

    if (subresource === "availability") {
      sendJson(res, 200, photographer.availability);
      return;
    }

    sendJson(res, 404, { error: "Nieobsługiwany zasób." });
    return;
  }

  if (pathname === "/api/bookings" && req.method === "POST") {
    try {
      const body = await parseBody(req);
      const validation = validateBooking(body);
      if (!validation.valid) {
        sendJson(res, 422, { error: validation.reason });
        return;
      }

      const booking = createBooking(body);
      const bookings = await readBookings();
      bookings.push(booking);
      await writeBookings(bookings);
      sendJson(res, 201, booking);
    } catch (error) {
      sendJson(res, 400, { error: error.message ?? "Nieoczekiwany błąd" });
    }
    return;
  }

  const bookingMatch = pathname.match(/^\/api\/bookings\/([A-Za-z0-9\-]+)$/);
  if (bookingMatch && req.method === "GET") {
    const bookingId = bookingMatch[1];
    const bookings = await readBookings();
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) {
      sendJson(res, 404, { error: "Nie znaleziono rezerwacji." });
      return;
    }
    sendJson(res, 200, booking);
    return;
  }

  sendJson(res, 404, { error: "Endpoint nie istnieje." });
});

server.listen(PORT, () => {
  console.log(`PixMemo API listening on port ${PORT}`);
});
