import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LiveMap from "@/components/live/LiveMap";
import { getLiveOnce, subscribeLiveSSE } from "@/api/client";

type Live = { lat: number; lng: number; ts: number } | null;

export default function TrackPhotographerPage() {
  const { id } = useParams(); // tu to jest trackToken
  const [pos, setPos] = useState<Live>(null);
  const [mode, setMode] = useState<"api" | "demo">("api");

  useEffect(() => {
    if (!id) return;
    // Najpierw spróbuj API via SSE
    const stop = subscribeLiveSSE(id, (data) => {
      if (data && typeof data.lat === "number") {
        setMode("api");
        setPos(data);
      }
    });

    // Fallback: po 2s sprawdź, czy coś przyszło — jeśli nie, polling + DEMO
    const t = setTimeout(async () => {
      if (!pos) {
        try {
          const once = await getLiveOnce(id);
          if (once && typeof once.lat === "number") {
            setMode("api");
            setPos(once);
          } else {
            // DEMO fallback – localStorage
            setMode("demo");
            const key = `pm_live_${id}`;
            const readDemo = () => {
              const raw = localStorage.getItem(key);
              setPos(raw ? JSON.parse(raw) : null);
            };
            readDemo();
            const intv = setInterval(readDemo, 2000);
            return () => clearInterval(intv);
          }
        } catch {
          setMode("demo");
        }
      }
    }, 2000);

    return () => { stop(); clearTimeout(t); };
  }, [id]);

  if (!id) return <p className="p-4">Brak tokenu śledzenia.</p>;
  if (!pos) return <p className="p-4">Czekam na lokalizację fotografa…</p>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Lokalizacja fotografa (LIVE)</h1>
      <p className="text-xs text-zinc-500">Tryb: {mode === "api" ? "API" : "DEMO"}</p>
      <LiveMap lat={pos.lat} lng={pos.lng} label="Fotograf (LIVE)" />
      <div className="text-xs text-zinc-600">Ost. aktualizacja: {new Date(pos.ts).toLocaleTimeString()}</div>
    </section>
  );
}
