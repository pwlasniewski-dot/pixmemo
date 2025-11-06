// src/components/live/LiveMap.tsx
type Props = {
  lat: number;
  lng: number;
  label?: string;
  zoom?: number;
  className?: string;
};

export default function LiveMap({
  lat,
  lng,
  label = "Fotograf",
  className = "h-[420px] w-full",
}: Props) {
  return (
    <div
      className={`rounded-2xl border bg-slate-50 flex flex-col items-center justify-center text-center ${className}`}
    >
      <div className="text-lg font-semibold text-slate-700">{label}</div>
      <p className="text-sm text-zinc-600">
        Szerokość: <b>{lat.toFixed(4)}</b> · Długość: <b>{lng.toFixed(4)}</b>
      </p>
      <p className="text-xs text-zinc-500 mt-2 px-6">
        Podgląd mapy jest niedostępny w tym środowisku. W aplikacji produkcyjnej w tym miejscu pojawia się mapa
        OpenStreetMap z aktualną pozycją fotografa.
      </p>
    </div>
  );
}
