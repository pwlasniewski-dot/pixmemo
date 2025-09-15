// src/components/live/LiveShareWidget.tsx
import { useEffect, useRef, useState } from "react";

const keyFor = (id: string) => `pm_live_${id}`;

export default function LiveShareWidget({ photographerId }: { photographerId: string }) {
  const watchId = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState<"idle" | "running" | "error" | "denied">("idle");
  const [last, setLast] = useState<{ lat: number; lng: number; ts: number } | null>(null);

  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  const start = async () => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      alert("Geolokalizacja niedostępna w tej przeglądarce.");
      return;
    }

    // Opcjonalnie: podejrzenie uprawnień (nie wszystkie przeglądarki wspierają)
    try {
      // @ts-expect-error – Permissions API bywa nie w TS/DOM
      const perm = await navigator.permissions?.query({ name: "geolocation" });
      if (perm?.state === "denied") {
        setStatus("denied");
        alert("Dostęp do lokalizacji jest zablokowany. Zmień ustawienia przeglądarki.");
        return;
      }
    } catch {
      // ignore
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const data = { lat, lng, ts: Date.now() };
        try {
          localStorage.setItem(keyFor(photographerId), JSON.stringify(data)); // DEMO: lokalnie
        } catch {
          // np. brak miejsca – pomijamy
        }
        setLast(data);
        setStatus("running");
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
        alert("Błąd geolokalizacji: " + err.message);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    setEnabled(true);
  };

  const stop = () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setEnabled(false);
    setStatus("idle");
  };

  return (
    <div className="rounded-2xl border p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">LIVE lokalizacja (DEMO)</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            status === "running"
              ? "bg-green-100 text-green-700"
              : status === "denied"
              ? "bg-red-100 text-red-700"
              : status === "error"
              ? "bg-amber-100 text-amber-700"
              : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {status === "running" ? "aktywny" : status === "denied" ? "odmowa" : status === "error" ? "błąd" : "gotowy"}
        </span>
      </div>

      <p className="text-sm text-zinc-600">
        Udostępnij bieżącą pozycję klientowi. W demo pozycja zapisywana jest lokalnie (<code>localStorage</code>).
        W produkcji wyślemy ją do API i udostępnimy pod linkiem <code>/track/&lt;id&gt;</code>.
      </p>

      {!enabled ? (
        <button onClick={start} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          Udostępnij lokalizację (start)
        </button>
      ) : (
        <button onClick={stop} className="px-4 py-2 rounded-lg border hover:bg-zinc-50">
          Zatrzymaj udostępnianie
        </button>
      )}

      {last && (
        <div className="text-xs text-zinc-600">
          Ostatnia: {last.lat.toFixed(5)}, {last.lng.toFixed(5)} · {new Date(last.ts).toLocaleTimeString()}
        </div>
      )}

      <div className="text-xs text-zinc-500">
        Link do podglądu: <code>/pixmemo/track/{photographerId}</code>
      </div>
    </div>
  );
}
