import { useEffect, useRef, useState } from "react";
import { postLiveLocation } from "@/api/client";

export default function LiveShareWidget({
  trackToken, // <<— token z bookingu (confirmed)
  mode = "api", // "api" | "demo"
  photographerId,
}: { trackToken?: string; mode?: "api" | "demo"; photographerId: string }) {
  const watchId = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [last, setLast] = useState<{lat:number;lng:number;ts:number} | null>(null);

  useEffect(() => () => { if (watchId.current) navigator.geolocation.clearWatch(watchId.current); }, []);

  const start = () => {
    if (!("geolocation" in navigator)) return alert("Geolokalizacja niedostępna.");
    watchId.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const data = { lat, lng, ts: Date.now() };

        if (mode === "api" && trackToken) {
          try { await postLiveLocation(trackToken, lat, lng); } catch (e:any) { console.warn(e?.message); }
        } else {
          // DEMO fallback: localStorage
          localStorage.setItem(`pm_live_${photographerId}`, JSON.stringify(data));
        }
        setLast(data);
      },
      (err) => alert("Błąd geolokalizacji: " + err.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
    setEnabled(true);
  };

  const stop = () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null; setEnabled(false);
  };

  return (
    <div className="rounded-2xl border p-4 space-y-2">
      <h3 className="font-semibold">LIVE lokalizacja {mode === "api" ? "(API)" : "(DEMO)"}</h3>
      {!trackToken && mode==="api" && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded">
          Wybierz rezerwację (confirmed), żeby pojawił się token śledzenia.
        </p>
      )}
      {!enabled ? (
        <button onClick={start} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          Start
        </button>
      ) : (
        <button onClick={stop} className="px-4 py-2 rounded-lg border">Stop</button>
      )}
      {last && <div className="text-xs text-zinc-600">Ostatnia: {last.lat.toFixed(5)}, {last.lng.toFixed(5)} · {new Date(last.ts).toLocaleTimeString()}</div>}
    </div>
  );
}
