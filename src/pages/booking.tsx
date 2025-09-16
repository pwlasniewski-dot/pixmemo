import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createBooking, getPhotographer, type BookingStatus } from "../api/client";
import Spinner from "../components/Spinner";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import AddressFields from "../components/AddressFields";
import PriceSummary from "../components/PriceSummary";
import { saveDraft } from "../store/bookingDraft";
import { useAuth } from "@/hooks/useAuth";

const FREE_KM = 10; // km w cenie
const RATE_PER_KM = 2; // PLN / km powyżej FREE_KM (demo)

export default function BookingPage() {
  const [params] = useSearchParams();
  const photographerId = params.get("photographerId") ?? "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photographer, setPhotographer] = useState<any>(null);

  const [pkgId, setPkgId] = useState<string>("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState<string>("");
  const [addr, setAddr] = useState({ street: "", postal: "", city: "" });
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [discountPct, setDiscountPct] = useState<number>(0);
  const [clientEmail, setClientEmail] = useState<string>("");
  const [submitTarget, setSubmitTarget] = useState<"stripe" | "p24">("stripe");
  const [submitting, setSubmitting] = useState(false);

  const nav = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPhotographer(photographerId)
      .then((res) => {
        setPhotographer(res);
        setPkgId(res?.packages?.[0]?.id ?? "");
        if (res?.availability?.length) {
          setDate(res.availability[0].date);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Nie udało się pobrać profilu fotografa");
        setLoading(false);
      });
  }, [photographerId]);

  useEffect(() => {
    if (user?.email) setClientEmail(user.email);
  }, [user?.email]);

  const basePrice = useMemo(() => {
    const pk = photographer?.packages?.find((x: any) => x.id === pkgId);
    return pk?.price_pln ?? 0;
  }, [photographer, pkgId]);

  const travelPrice = useMemo(() => {
    const over = Math.max(0, distanceKm - FREE_KM);
    return Math.round(over * RATE_PER_KM);
  }, [distanceKm]);

  const availableSlots: string[] = useMemo(() => {
    const day = photographer?.availability?.find((d: any) => d.date === date);
    return day?.slots ?? [];
  }, [photographer, date]);

  useEffect(() => {
    if (slot && !availableSlots.includes(slot)) setSlot("");
  }, [availableSlots, slot]);

  const subtotal = useMemo(() => basePrice + travelPrice, [basePrice, travelPrice]);
  const discountValue = useMemo(
    () => Math.round((subtotal * discountPct) / 100),
    [subtotal, discountPct]
  );
  const total = useMemo(() => subtotal - discountValue, [subtotal, discountValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photographer) return;
    setError(null);

    if (!clientEmail.trim()) {
      setError("Podaj e-mail do potwierdzenia rezerwacji.");
      return;
    }
    if (!pkgId) {
      setError("Wybierz pakiet.");
      return;
    }
    if (!date) {
      setError("Wybierz datę rezerwacji.");
      return;
    }
    if (!slot) {
      setError("Wybierz dostępny slot czasowy.");
      return;
    }
    if (!addr.street.trim() || !addr.city.trim() || !addr.postal.trim()) {
      setError("Uzupełnij pełny adres.");
      return;
    }
    if (!/^\d{2}-\d{3}$/.test(addr.postal.trim())) {
      setError("Kod pocztowy powinien mieć format 00-000.");
      return;
    }

    const pkg = photographer.packages?.find((x: any) => x.id === pkgId);
    if (!pkg) {
      setError("Wybrany pakiet jest niedostępny.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createBooking({
        clientEmail: clientEmail.trim(),
        photographer_id: photographerId,
        package_id: pkgId,
        date,
        time: slot,
        address: addr,
        price_final_pln: total,
      });

      saveDraft({
        bookingId: res.booking_id,
        status: res.status as BookingStatus,
        trackToken: res.track_token,
        clientEmail: clientEmail.trim(),
        photographerId,
        photographerName: photographer.full_name,
        photographerCity: photographer.city,
        pkgId,
        pkgName: pkg?.name || "",
        date,
        slot,
        address: addr,
        distanceKm,
        discountPct,
        price: {
          base: basePrice,
          travel: travelPrice,
          discount: discountValue,
          total,
        },
      });

      nav(submitTarget === "stripe" ? "/checkout/stripe" : "/checkout/p24");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się utworzyć rezerwacji");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error && !photographer) return <p className="text-red-600">{error}</p>;
  if (!photographer) return <p>Nie znaleziono fotografa.</p>;

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
      <section className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border p-4">
          <h1 className="text-xl font-bold mb-3">Rezerwacja — {photographer.full_name}</h1>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Pakiet</label>
              <select
                value={pkgId}
                onChange={(e) => setPkgId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border"
              >
                {photographer.packages?.map((pk: any) => (
                  <option key={pk.id} value={pk.id}>
                    {pk.name} — {pk.price_pln} PLN
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border"
              />
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <label className="block text-sm font-medium">Godzina</label>
            {availableSlots.length > 0 ? (
              <AvailabilityCalendar value={slot} onChange={setSlot} slots={availableSlots} />
            ) : (
              <p className="text-sm text-zinc-500">Brak wolnych slotów dla wybranej daty.</p>
            )}
          </div>

          <div className="space-y-2 mt-4">
            <label className="block text-sm font-medium">Adres</label>
            <AddressFields
              street={addr.street}
              postal={addr.postal}
              city={addr.city}
              onChange={(patch) => setAddr({ ...addr, ...patch })}
            />
          </div>

          <div className="space-y-2 mt-4">
            <label className="block text-sm font-medium">E-mail do potwierdzenia</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded-lg border"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="np. klient@pixmemo.pl"
            />
          </div>

          <div className="space-y-2 mt-4">
            <label className="block text-sm font-medium">Dystans (km)</label>
            <input
              type="number"
              min={0}
              value={distanceKm}
              onChange={(e) => {
                const val = Number(e.target.value);
                setDistanceKm(Number.isFinite(val) ? Math.max(0, val) : 0);
              }}
              className="w-full px-3 py-2 rounded-lg border"
              placeholder="np. 32"
            />
            <p className="text-xs text-zinc-500">
              {FREE_KM} km gratis · {RATE_PER_KM} PLN/km powyżej
            </p>
          </div>

          <div className="space-y-2 mt-4">
            <label className="block text-sm font-medium">Rabat</label>
            <select
              value={discountPct}
              onChange={(e) => setDiscountPct(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border"
            >
              {[0, 5, 10, 15].map((v) => (
                <option key={v} value={v}>
                  {v}%
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <PriceSummary base={basePrice} travel={travelPrice} discountPct={discountPct} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid gap-2">
          <button
            type="submit"
            onClick={() => setSubmitTarget("stripe")}
            disabled={submitting}
            className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting && submitTarget === "stripe"
              ? "Przetwarzanie..."
              : `Zapłać online (Stripe) — ${total} PLN`}
          </button>

          <button
            type="submit"
            onClick={() => setSubmitTarget("p24")}
            disabled={submitting}
            className="w-full px-4 py-3 rounded-xl border hover:bg-zinc-50 disabled:opacity-60"
          >
            {submitting && submitTarget === "p24"
              ? "Przetwarzanie..."
              : `Zapłać z Przelewy24 / BLIK — ${total} PLN`}
          </button>
        </div>

        <p className="text-xs text-zinc-500">
          W trybie DEMO płatność jest zasymulowana. Po podpięciu backendu płatności potwierdza webhook.
        </p>
      </aside>
    </form>
  );
}
