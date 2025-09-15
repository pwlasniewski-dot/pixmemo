import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getPhotographer } from "../api/client";
import Spinner from "../components/Spinner";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import AddressFields from "../components/AddressFields";
import PriceSummary from "../components/PriceSummary";
import { saveDraft } from "../store/bookingDraft";

const FREE_KM = 10;     // km w cenie
const RATE_PER_KM = 2;  // PLN / km powyżej FREE_KM (demo)

export default function BookingPage() {
  const [params] = useSearchParams();
  const photographerId = params.get("photographerId") ?? "";

  const [loading, setLoading] = useState(true);
  const [p, setP] = useState<any>(null);

  // formularz
  const [pkgId, setPkgId] = useState<string>("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState<string>("");
  const [addr, setAddr] = useState({ street: "", postal: "", city: "" });
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [discountPct, setDiscountPct] = useState<number>(0);

  const nav = useNavigate();

  useEffect(() => {
    setLoading(true);
    getPhotographer(photographerId).then((res) => {
      setP(res);
      setPkgId(res?.packages?.[0]?.id ?? "");
      setLoading(false);
    });
  }, [photographerId]);

  const basePrice = useMemo(() => {
    const pk = p?.packages?.find((x: any) => x.id === pkgId);
    return pk?.price_pln ?? 0;
  }, [p, pkgId]);

  const travelPrice = useMemo(() => {
    const over = Math.max(0, distanceKm - FREE_KM);
    return Math.round(over * RATE_PER_KM);
  }, [distanceKm]);

  const slots = ["10:00", "12:00", "17:30"]; // demo-sloty

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const pk = p.packages?.find((x: any) => x.id === pkgId);

    // zapis szkicu rezerwacji → checkout
    saveDraft({
      photographerId,
      photographerName: p.full_name,
      pkgId,
      pkgName: pk?.name || "",
      date,
      slot,
      address: addr,
      distanceKm,
      discountPct,
      price: {
        base: basePrice,
        travel: travelPrice,
        total: basePrice + travelPrice - Math.round((basePrice + travelPrice) * (discountPct / 100)),
      },
    });

    // domyślnie idziemy do Stripe (drugi przycisk prowadzi do P24)
    nav("/checkout/stripe");
  };

  if (loading) return <Spinner />;
  if (!p) return <p>Nie znaleziono fotografa.</p>;

  const total = basePrice + travelPrice;
  return (
    <form onSubmit={submit} className="grid lg:grid-cols-3 gap-8">
      <section className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border p-4">
          <h1 className="text-xl font-bold mb-3">Rezerwacja — {p.full_name}</h1>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Pakiet */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Pakiet</label>
              <select
                value={pkgId}
                onChange={(e) => setPkgId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border"
              >
                {p.packages?.map((pk: any) => (
                  <option key={pk.id} value={pk.id}>
                    {pk.name} — {pk.price_pln} PLN
                  </option>
                ))}
              </select>
            </div>

            {/* Data */}
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

          {/* Sloty */}
          <div className="space-y-2 mt-4">
            <label className="block text-sm font-medium">Godzina</label>
            <AvailabilityCalendar value={slot} onChange={setSlot} slots={slots} />
          </div>

          {/* Adres */}
          <div className="space-y-2 mt-4">
            <label className="block text-sm font-medium">Adres</label>
            <AddressFields
              street={addr.street}
              postal={addr.postal}
              city={addr.city}
              onChange={(patch) => setAddr({ ...addr, ...patch })}
            />
          </div>

          {/* Dystans */}
          <div className="space-y-2 mt-4">
            <label className="block text-sm font-medium">Dystans (km)</label>
            <input
              type="number"
              min={0}
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border"
              placeholder="np. 32"
            />
            <p className="text-xs text-zinc-500">
              {FREE_KM} km gratis · {RATE_PER_KM} PLN/km powyżej
            </p>
          </div>

          {/* Rabat */}
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

        <div className="grid gap-2">
          <button
            type="submit"
            className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Zapłać online (Stripe)
          </button>

          <Link
            to="/checkout/p24"
            className="w-full text-center px-4 py-3 rounded-xl border hover:bg-zinc-50"
          >
            Zapłać z Przelewy24 / BLIK
          </Link>
        </div>

        <p className="text-xs text-zinc-500">
          W trybie DEMO płatność jest zasymulowana. Po podpięciu backendu płatności potwierdza webhook.
        </p>
      </aside>
    </form>
  );
}
