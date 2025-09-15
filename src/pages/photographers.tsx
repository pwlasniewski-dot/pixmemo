// src/pages/photographers.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPhotographers } from "../api/client";
import PhotoCard from "../components/PhotoCard";
import Spinner from "../components/Spinner";
import type { Photographer } from "../types";

/** Dzisiejsza data w lokalnej strefie (yyyy-mm-dd) */
function todayLocalISO(): string {
  const now = new Date();
  const tzOffsetMs = now.getTimezoneOffset() * 60_000;
  const local = new Date(now.getTime() - tzOffsetMs);
  return local.toISOString().slice(0, 10);
}

export default function PhotographersPage() {
  const [params, setParams] = useSearchParams();

  // Stany inputów
  const [cityInput, setCityInput] = useState<string>(params.get("city") ?? "");
  const [dateInput, setDateInput] = useState<string>(
    params.get("date") ?? todayLocalISO()
  );

  // Dane
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<Photographer[]>([]);

  // Debounce miasta
  const [cityQuery, setCityQuery] = useState<string>(cityInput);
  const debounceTimer = useRef<number | null>(null);
  useEffect(() => {
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(
      () => setCityQuery(cityInput.trim()),
      300
    );
    return () => {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    };
  }, [cityInput]);

  // Parametry z URL
  const queryCity = params.get("city") ?? "";
  const queryDate = params.get("date") ?? "";

  // Pobieranie listy
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    getPhotographers({ city: queryCity, date: queryDate })
      .then((res) => {
        if (!alive) return;
        setList(res);
        setLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.message || "Nie udało się pobrać fotografów.");
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [queryCity, queryDate]);

  // Aktualizacja URL
  const updateParam = (key: string, value?: string) => {
    const p = new URLSearchParams(params);
    if (value && value.length > 0) p.set(key, value);
    else p.delete(key);
    setParams(p, { replace: true });
  };

  const onCityChange = (v: string) => {
    setCityInput(v);
    updateParam("city", v.trim());
  };
  const onDateChange = (v: string) => {
    setDateInput(v);
    updateParam("date", v);
  };

  const dateDefault = useMemo(() => todayLocalISO(), []);
  const onReset = () => {
    setCityInput("");
    setDateInput(dateDefault);
    const p = new URLSearchParams(params);
    p.delete("city");
    p.set("date", dateDefault);
    setParams(p, { replace: true });
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Dostępni fotografowie</h1>
        <button
          onClick={onReset}
          className="text-sm px-3 py-1.5 rounded-lg border hover:bg-zinc-50"
        >
          Reset filtrów
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          className="px-3 py-2 rounded-lg border min-w-[220px]"
          placeholder="Miasto (np. Toruń)"
          value={cityInput}
          onChange={(e) => onCityChange(e.target.value)}
          inputMode="search"
        />
        <input
          type="date"
          className="px-3 py-2 rounded-lg border"
          value={dateInput || dateDefault}
          onChange={(e) => onDateChange(e.target.value)}
          min={dateDefault}
        />
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-800">
          {error}
        </div>
      ) : list.length === 0 ? (
        <p className="text-zinc-600">
          Brak wyników dla filtrów
          {queryCity ? ` („${queryCity}”)` : ""}{" "}
          {queryDate ? ` i daty ${queryDate}` : ""}.
        </p>
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
