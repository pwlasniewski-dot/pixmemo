import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPhotographers } from "../api/client";
import PhotoCard from "../components/PhotoCard";
import Spinner from "../components/Spinner";
import type { Photographer } from "../types";

export default function PhotographersPage() {
  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<Photographer[]>([]);

  const city = params.get("city") ?? "";
  const date = params.get("date") ?? "";

  useEffect(() => {
    setLoading(true);
    getPhotographers({ city, date }).then((res) => {
      setList(res);
      setLoading(false);
    });
  }, [city, date]);

  const onCity = (v: string) => {
    const p = new URLSearchParams(params);
    v ? p.set("city", v) : p.delete("city");
    setParams(p, { replace: true });
  };

  const onDate = (v: string) => {
    const p = new URLSearchParams(params);
    v ? p.set("date", v) : p.delete("date");
    setParams(p, { replace: true });
  };

  const dateDefault = useMemo(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }, []);

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Dostępni fotografowie</h1>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          className="px-3 py-2 rounded-lg border"
          placeholder="Miasto"
          value={city}
          onChange={(e) => onCity(e.target.value)}
        />
        <input
          type="date"
          className="px-3 py-2 rounded-lg border"
          value={date || dateDefault}
          onChange={(e) => onDate(e.target.value)}
        />
      </div>

      {loading ? (
        <Spinner />
      ) : list.length === 0 ? (
        <p className="text-zinc-600">Brak wyników dla wybranych filtrów.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((p) => (
            <PhotoCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </section>
  );
}
