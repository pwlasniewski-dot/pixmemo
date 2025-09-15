import { useEffect, useMemo, useState } from "react";
import {
  DaySlots,
  PhotographerProfile,
  loadMe,
  saveMe,
  upsertPackage,
  deletePackage,
  setDaySlots,
  deleteDay,
  updateProfile,
} from "../../api/mock_photographer";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="rounded-2xl border p-4">{children}</div>
    </section>
  );
}

export default function PhotographerDashboardPage() {
  const [me, setMe] = useState<PhotographerProfile | null>(null);

  // formy profilu
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState("");

  // pakiety – edycja
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pkgName, setPkgName] = useState("");
  const [pkgPrice, setPkgPrice] = useState<number>(0);
  const [pkgDesc, setPkgDesc] = useState("");

  // dostępność
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [slotInput, setSlotInput] = useState("");
  const [slots, setSlots] = useState<string[]>([]);

  useEffect(() => {
    const m = loadMe();
    setMe(m);
    setFullName(m.full_name);
    setCity(m.city);
    setBio(m.bio);
    setPhoto(m.primary_photo_url);

    const today = m.availability.find((d) => d.date === date);
    setSlots(today?.slots ?? []);
  }, []);

  // odśwież slots po zmianie daty
  useEffect(() => {
    if (!me) return;
    const found = me.availability.find((d) => d.date === date);
    setSlots(found?.slots ?? []);
  }, [date, me]);

  const addOrUpdatePkg = () => {
    if (!pkgName.trim() || pkgPrice <= 0) return alert("Podaj nazwę i cenę > 0.");
    const list = upsertPackage({
      id: editingId || undefined,
      name: pkgName.trim(),
      price_pln: Math.round(pkgPrice),
      description: pkgDesc.trim() || undefined,
    });
    setMe((m) => (m ? { ...m, packages: list } : m));
    setEditingId(null);
    setPkgName("");
    setPkgPrice(0);
    setPkgDesc("");
  };

  const editPkg = (id: string) => {
    if (!me) return;
    const pk = me.packages.find((p) => p.id === id);
    if (!pk) return;
    setEditingId(pk.id);
    setPkgName(pk.name);
    setPkgPrice(pk.price_pln);
    setPkgDesc(pk.description ?? "");
  };

  const removePkg = (id: string) => {
    const list = deletePackage(id);
    setMe((m) => (m ? { ...m, packages: list } : m));
    if (editingId === id) {
      setEditingId(null);
      setPkgName("");
      setPkgPrice(0);
      setPkgDesc("");
    }
  };

  const addSlot = () => {
    const v = slotInput.trim();
    if (!v) return;
    if (!/^\d{1,2}:\d{2}$/.test(v)) return alert("Format godziny HH:MM, np. 17:30");
    if (slots.includes(v)) return;
    setSlots((s) => [...s, v].sort());
    setSlotInput("");
  };

  const removeSlot = (s: string) => {
    setSlots((list) => list.filter((x) => x !== s));
  };

  const saveDay = () => {
    const list = setDaySlots(date, slots);
    setMe((m) => (m ? { ...m, availability: list } : m));
  };

  const deleteThisDay = () => {
    const list = deleteDay(date);
    setMe((m) => (m ? { ...m, availability: list } : m));
    setSlots([]);
  };

  const saveProfile = () => {
    const next = updateProfile({
      full_name: fullName.trim(),
      city: city.trim(),
      bio: bio.trim(),
      primary_photo_url: photo.trim(),
    });
    setMe(next);
    alert("Zapisano profil ✅");
  };

  const totalSlots = useMemo(
    () => me?.availability.reduce((acc, d) => acc + d.slots.length, 0) ?? 0,
    [me]
  );

  if (!me) return <p>Ładowanie…</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Panel Fotografa</h1>

      {/* PROFIL */}
      <Section title="Mój profil">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Imię i nazwisko</label>
            <input
              className="w-full px-3 py-2 rounded-lg border"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <label className="block text-sm font-medium mt-3">Miasto</label>
            <input
              className="w-full px-3 py-2 rounded-lg border"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <label className="block text-sm font-medium mt-3">Link do zdjęcia profilowego</label>
            <input
              className="w-full px-3 py-2 rounded-lg border"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
            />
            <button
              onClick={saveProfile}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              Zapisz profil
            </button>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium">Opis/Bio</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border min-h-[180px]"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <div className="mt-3 rounded-xl overflow-hidden border">
              <img src={photo} alt="cover" className="w-full h-56 object-cover" />
            </div>
          </div>
        </div>
      </Section>

      {/* PAKIETY */}
      <Section title="Pakiety (CRUD)">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Nazwa</label>
            <input
              className="w-full px-3 py-2 rounded-lg border"
              placeholder="np. Złoty"
              value={pkgName}
              onChange={(e) => setPkgName(e.target.value)}
            />
            <label className="block text-sm font-medium mt-2">Cena (PLN)</label>
            <input
              type="number"
              className="w-full px-3 py-2 rounded-lg border"
              placeholder="np. 700"
              value={pkgPrice}
              onChange={(e) => setPkgPrice(Number(e.target.value))}
            />
            <label className="block text-sm font-medium mt-2">Opis (opcjonalnie)</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border min-h-[90px]"
              placeholder="Co zawiera pakiet…"
              value={pkgDesc}
              onChange={(e) => setPkgDesc(e.target.value)}
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={addOrUpdatePkg}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                type="button"
              >
                {editingId ? "Zapisz zmiany" : "Dodaj pakiet"}
              </button>
              {editingId && (
                <button
                  className="px-4 py-2 rounded-lg border"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setPkgName("");
                    setPkgPrice(0);
                    setPkgDesc("");
                  }}
                >
                  Anuluj
                </button>
              )}
            </div>
          </div>

          <div>
            <ul className="space-y-2">
              {me.packages.map((pk) => (
                <li
                  key={pk.id}
                  className="flex items-start justify-between gap-4 rounded-xl border p-3"
                >
                  <div>
                    <div className="font-medium">{pk.name}</div>
                    <div className="text-sm text-zinc-600">{pk.price_pln} PLN</div>
                    {pk.description && (
                      <div className="text-sm text-zinc-500 mt-1">{pk.description}</div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className="px-3 py-1.5 rounded-lg border" onClick={() => editPkg(pk.id)}>
                      Edytuj
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg border hover:bg-red-50"
                      onClick={() => removePkg(pk.id)}
                    >
                      Usuń
                    </button>
                  </div>
                </li>
              ))}
              {me.packages.length === 0 && (
                <li className="text-sm text-zinc-500">Brak pakietów. Dodaj pierwszy po lewej.</li>
              )}
            </ul>
          </div>
        </div>
      </Section>

      {/* DOSTĘPNOŚĆ */}
      <Section title="Dostępność (sloty)">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Dzień</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg border"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <label className="block text-sm font-medium mt-2">Dodaj slot (HH:MM)</label>
            <div className="flex gap-2">
              <input
                className="w-full px-3 py-2 rounded-lg border"
                placeholder="np. 17:30"
                value={slotInput}
                onChange={(e) => setSlotInput(e.target.value)}
              />
              <button className="px-3 py-2 rounded-lg border" type="button" onClick={addSlot}>
                Dodaj
              </button>
            </div>
            <div className="flex gap-2 flex-wrap pt-2">
              {slots.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => removeSlot(s)}
                  className="px-3 py-1.5 rounded-lg border text-sm hover:bg-zinc-50"
                  title="Usuń slot"
                >
                  {s} ✕
                </button>
              ))}
              {slots.length === 0 && (
                <div className="text-sm text-zinc-500">Brak slotów dla tego dnia.</div>
              )}
            </div>
            <div className="flex gap-2 pt-3">
              <button
                onClick={saveDay}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                type="button"
              >
                Zapisz dzień
              </button>
              <button onClick={deleteThisDay} className="px-4 py-2 rounded-lg border" type="button">
                Usuń dzień
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-medium mb-2">Kalendarz (przegląd)</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {me.availability.map((d: DaySlots) => (
                <div key={d.date} className="rounded-xl border p-3">
                  <div className="font-medium">{d.date}</div>
                  <div className="mt-1 flex flex-wrap gap-1 text-sm">
                    {d.slots.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-zinc-100">
                        {s}
                      </span>
                    ))}
                    {d.slots.length === 0 && (
                      <span className="text-zinc-500 text-sm">brak</span>
                    )}
                  </div>
                </div>
              ))}
              {me.availability.length === 0 && (
                <div className="text-sm text-zinc-500">Brak zapisanych dni.</div>
              )}
            </div>
            <div className="text-xs text-zinc-500 mt-2">
              Łącznie slotów: <b>{totalSlots}</b>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
