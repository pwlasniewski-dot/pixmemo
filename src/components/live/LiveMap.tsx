// src/components/live/LiveMap.tsx
import "@/lib/leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

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
  zoom = 13,
  className = "h-[420px] w-full",
}: Props) {
  const center: [number, number] = [lat, lng];

  return (
    <div className={`rounded-2xl overflow-hidden border ${className}`}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>{label}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
