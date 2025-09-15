
# PixMemo — Kompletny przewodnik wdrożeniowy (MVP 30 dni)
**Wersja:** v1.0  
**Dla kogo:** właściciel projektu (bez doświadczenia programistycznego) + zespół dev  
**Cel:** uruchomić MVP PixMemo (PWA + Android przez Capacitor) z rezerwacjami i płatnościami Stripe/Przelewy24, w 30 dni.

---

## 0) Szybki skrót: co zrobisz po kolei
1. **Skonfigurujesz projekt** (alias `@`, PWA, Capcitor).  
2. **Zbudujesz ekrany klienta** (lista fotografów, profil, rezerwacja, płatność).  
3. **Zbudujesz panel fotografa** (rejestracja, weryfikacja, kalendarz).  
4. **Zbudujesz panel admina** (zatwierdzanie, podgląd rezerwacji, wypłaty manualne).  
5. **Podłączysz płatności** (Stripe karty/Apple/Google + Przelewy24 BLIK/przelewy).  
6. **Wdrożysz i przetestujesz** (PWA + Google Play „closed testing”).  

---

## 1) Struktura katalogów (docelowa)
> Jeśli coś już masz, nie kasuj – porównaj i scal.

```
project-root/
├─ src/
│  ├─ components/
│  │  ├─ WheelOfFortune.tsx           # Koło fortuny (opcjonalnie tylko dla promo strony lokalnej)
│  │  ├─ PhotoCard.tsx                # Karta fotografa (lista)
│  │  ├─ PackageCard.tsx              # Karta pakietu
│  │  ├─ RatingStars.tsx              # Gwiazdki/ocena
│  │  ├─ AvailabilityCalendar.tsx     # Prosty kalendarz slotów (wolny/zajęty)
│  │  ├─ AddressFields.tsx            # Ulica/Kod/Miasto + link do Google Maps
│  │  ├─ PriceSummary.tsx             # Podsumowanie ceny (rabat + dojazd + suma)
│  │  └─ Spinner.tsx                  # Loader/stan „czekaj”
│  ├─ pages/
│  │  ├─ home.tsx                     # Landing PixMemo (klient)
│  │  ├─ photographers.tsx            # Lista fotografów z filtrem
│  │  ├─ photographer_[id].tsx        # Profil fotografa
│  │  ├─ booking.tsx                  # Rezerwacja + płatność
│  │  ├─ auth/
│  │  │  ├─ login.tsx                 # Logowanie (fotograf/admin)
│  │  │  └─ register_photographer.tsx # Rejestracja fotografa
│  │  ├─ dashboard/
│  │  │  ├─ photographer.tsx          # Panel fotografa
│  │  │  └─ admin.tsx                 # Panel admina
│  │  └─ legal/
│  │     ├─ terms.md                  # Regulamin (renderowany)
│  │     └─ privacy.md                # Polityka prywatności (renderowana)
│  ├─ api/
│  │  └─ client.ts                    # Helpery do zapytań do backendu
│  ├─ hooks/
│  │  └─ useAuth.ts                   # Stan/logika auth w FE
│  ├─ store/
│  │  └─ appStore.ts                  # (opcjonalnie) Zustand/Context dla globalnego stanu
│  ├─ styles/
│  │  └─ globals.css                  # Tailwind + dodatkowe style
│  ├─ App.tsx
│  ├─ AppRoutes.tsx
│  └─ main.tsx
├─ public/
│  ├─ apple-developer-merchantid-domain-association  # do Apple Pay (Stripe guide)
│  └─ icons/                                         # ikony PWA
├─ docs/
│  ├─ architecture.md
│  ├─ database.md
│  ├─ api.md
│  ├─ payments.md
│  ├─ legal/
│  │  ├─ regulamin.md
│  │  ├─ rodo.md
│  │  └─ umowa_fotograf.md
│  ├─ qa.md
│  ├─ roadmap.md
│  └─ marketing.md
├─ capacitor.config.ts                 # po dodaniu Capacitor
├─ vite.config.ts                      # alias @ → src
├─ tsconfig.json                       # paths dla @/*
├─ package.json
├─ .env.local                          # klucze (tylko lokalnie)
└─ README.md
```

---

## 2) Konfiguracja aliasu `@` (żeby działały importy)
**vite.config.ts** – dodaj alias:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

**tsconfig.json** – dodaj ścieżki:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

> Jeśli nie chcesz aliasu – zastąp importy ścieżkami relatywnymi (np. `../components/...`).

---

## 3) Minimalne ekrany i komponenty (opis co robią)

### Strona klienta
- **home.tsx:** krótki opis PixMemo + CTA „Znajdź fotografa na dziś/jutro”.
- **photographers.tsx:** lista fotografów (karta: zdjęcie, miasto, rating, „od X PLN”). Filtr po mieście i dacie.
- **photographer_[id].tsx:** profil z portfolio, opis, pakiety, oceny. Przycisk „Rezerwuj”.
- **booking.tsx:** formularz rezerwacji (pakiet, data/godzina, adres, dystans/dojazd, bonus z koła fortuny). Płatność online → potwierdzenie.

**Komponenty:**
- PhotoCard, PackageCard, RatingStars, AvailabilityCalendar, AddressFields, PriceSummary, Spinner.

### Strona fotografa
- **auth/login.tsx:** logowanie fotografa/admina.
- **auth/register_photographer.tsx:** rejestracja + wstępne portfolio; po submit – status „oczekuje na weryfikację”.
- **dashboard/photographer.tsx:** edycja profilu (bio, miasto, zdjęcie), pakiety, dostępność (sloty), rezerwacje do akceptacji.

### Admin
- **dashboard/admin.tsx:** zakładki: Fotografowie do weryfikacji (zatwierdź/odrzuć), Rezerwacje (statusy), Raporty (prowizje).

---

## 4) Backend (na poziomie wdrożenia – bez kodu)
- Technologia: **Node.js + Express + TypeScript + Prisma (ORM)**.
- Baza: **Postgres** (np. Neon, Supabase). Backup codzienny.
- Autoryzacja: **JWT** dla fotografa i admina; klient może bookować bez konta (podając e-mail/telefon).
- E-maile: **Resend** (prościejszy start) – potwierdzenia rezerwacji.
- Płatności:
  - **Stripe** – karty, Apple Pay, Google Pay (łatwy start, globalny zasięg).
  - **Przelewy24** – BLIK i szybkie przelewy (dla PL).

**Ważne zasady:**
- Płatność zawsze potwierdzamy **webhookiem** (nie ufać tylko temu, co pokaże przeglądarka).
- Kwoty trzymamy w **groszach**/**integerach** (np. 374 PLN = 37400).
- Weryfikacja fotografa: dopiero po **zatwierdzeniu przez admina** profil jest publiczny.

---

## 5) Płatności — jak je uruchomić krok po kroku
**Stripe (karty, Apple Pay, Google Pay):**
1. Załóż konto Stripe → zgłoś domenę i włącz Apple Pay/Google Pay (Stripe Dashboard).  
2. W FE użyjesz Stripe Elements albo Payment Request Button (Apple/Google).  
3. W BE: endpoint „create payment intent” → zwrócenie `clientSecret`.  
4. **Webhook**: `payment_intent.succeeded` → ustawiasz booking na `confirmed` i wysyłasz maila.

**Przelewy24 (BLIK, przelewy):**
1. Załóż konto P24 → tryb sandbox do testów.  
2. W BE: utworzenie transakcji i redirect klienta do P24.  
3. **Webhook**: potwierdzenie udanej płatności → `confirmed`.

> MVP: kasa wpływa na Twoje konto. Rozliczenia z fotografem robisz manualnie (raz w tygodniu, przelew w PLN).  
> W wersji 1.2: rozważ „split payments” (Stripe Connect / P24 partners).

---

## 6) RODO i legal – co mieć gotowe
- **Regulamin serwisu** (rola pośrednika, odpowiedzialność, spory, zwroty).
- **Polityka prywatności** (jakie dane, po co, komu udostępniasz, retencja, prawa użytkownika).
- **Umowa współpracy z fotografem** (prowizja, standard jakości, prawo do zawieszenia, licencja na miniatury).
- **Zgody**: cookies, marketing (opcjonalnie).

> W docs/legal/ wstaw szablony i dostosuj z prawnikiem. Minimalizacja danych: nie zbierasz PESEL, kart – karty trzyma Stripe/P24.

---

## 7) Plan 30 dni — dzień po dniu (MVP)
> Każdy dzień to **cel + wynik**, tak byś wiedział, co wykonać. Załóż min. 2–4h pracy/dzień.

### Tydzień 1 — Fundament techniczny
**D1:** Repo + porządek projektu  
- Ustaw alias `@` (vite/tsconfig), dodaj `docs/` (puste pliki z nagłówkami).  
- Efekt: projekt buduje się lokalnie, importy działają.

**D2:** Routing i szkielety ekranów  
- Stwórz puste `pages/` zgodnie ze strukturą.  
- Efekt: przełączanie między ekranami działa (nawigacja).

**D3:** Komponenty wspólne (UI)  
- Stwórz: PhotoCard, PackageCard, RatingStars, Spinner.  
- Efekt: lista z 2–3 kartami mockowymi.

**D4:** Formularz rezerwacji (bez płatności)  
- Ekran booking: pakiet, adres, dystans, podsumowanie.  
- Efekt: klik „Potwierdź rezerwację” — wyświetla podsumowanie (jeszcze bez kasy).

**D5:** PWA setup  
- `manifest.json`, ikony, service worker (vite-plugin-pwa lub ręcznie).  
- Efekt: na Androidzie pojawia się „Dodaj do ekranu głównego”.

**D6–D7:** Backend skeleton (jeśli sam robisz)  
- API: `/photographers`, `/bookings` (mock), `/auth` (fotograf/admin).  
- DB schema w `docs/database.md` + migracje (Prisma).  
- Efekt: FE może pobrać listę fotografów z BE (nawet statycznie).

### Tydzień 2 — Klient (booking)
**D8:** Lista fotografów (z filtrem)  
- Filtrowanie po mieście i dacie.  
- Efekt: widzisz demo-dane, zmiana filtra działa.

**D9:** Profil fotografa  
- Sekcje: opis, portfolio (miniatury), pakiety, oceny.  
- Efekt: klik „Rezerwuj” przenosi do booking z wybranym pakietem.

**D10:** Kalendarz dostępności (prosto)  
- AvailabilityCalendar: kilka slotów (np. 10:00, 12:00, 17:30).  
- Efekt: wybór slotu zapisuje się w formularzu.

**D11:** Dojazd i cena  
- AddressFields + przelicznik: FREE_KM/RATE_PER_KM → travelCost.  
- Efekt: podsumowanie pokazuje cenę po rabacie i z dojazdem.

**D12:** Maile (Resend)  
- Po „potwierdzeniu” (tymczasowo bez kasy) — wysyłasz mail klient/fotograf/admin (test).  
- Efekt: spływa realny mail potwierdzenia.

**D13–D14:** Testy E2E (ręczne) + poprawki UX  
- Klikalny flow: lista → profil → booking → podsumowanie → mail.  
- Efekt: stabilny „suchy” booking bez kasy.

### Tydzień 3 — Fotograf + Admin
**D15:** Rejestracja fotografa (formularz)  
- Upload 5–10 zdjęć (na start możesz trzymać w /public lub S3).  
- Efekt: fotograf ma status „oczekuje na weryfikację”.

**D16:** Panel fotografa  
- Edycja profilu, pakiety, kalendarz dostępności.  
- Efekt: fotograf może ustawić sloty i ceny.

**D17:** Panel admina – weryfikacje  
- Lista oczekujących → „Akceptuj/Odrzuć”.  
- Efekt: zaakceptowani pojawiają się w liście publicznej.

**D18:** Rezerwacje – statusy  
- pending → confirmed → done/cancelled (bez płatności).  
- Efekt: admin i fotograf widzą statusy w panelach.

**D19–D21:** Opinie  
- Po `done` klient może dodać ocenę i komentarz.  
- Efekt: oceny widoczne na profilu + liczy się rating_avg.

### Tydzień 4 — Płatności + publikacja
**D22:** Stripe — create intent + FE Elements  
- Pobierasz `clientSecret`, płacisz testową kartą 4242 4242 4242 4242.  
- Efekt: webhook zmienia booking na `confirmed` + mail „opłacono”.

**D23:** Apple/Google Pay w Stripe  
- Payment Request Button + weryfikacja domeny (Apple Pay).  
- Efekt: na iOS/Android pojawia się Apple/Google Pay (w testach).

**D24:** Przelewy24 — BLIK/przelewy (sandbox)  
- Utwórz transakcję, odbierz webhook.  
- Efekt: alternatywa dla Stripe (PL użytkownicy).

**D25:** QA regression  
- Sprawdź cały flow na Chrome/Firefox/Safari + Android/iOS (PWA).  
- Efekt: lista błędów i poprawki.

**D26:** Capacitor (Android build)  
- `npx cap add android` → build → Google Play Console (closed testing).  
- Efekt: apka udostępniona testerom.

**D27–D28:** Legal w aplikacji  
- Wstaw `legal/terms.md`, `legal/privacy.md` + linki w stopce + checkboxy zgód.  
- Efekt: formalnie gotowe do produkcji.

**D29–D30:** Marketing startowy  
- Landing (home.tsx) + FB/IG Ads lokalnie (Toruń).  
- Efekt: pozyskanie pierwszych rezerwacji.

---

## 8) Testy – od dnia 1 (lista kontrolna)
- [ ] Uruchamia się `npm run dev` bez błędów (alias @ działa).  
- [ ] Na telefonie Android — PWA „Dodaj do ekranu głównego”.  
- [ ] Lista fotografów renderuje z demo-danych.  
- [ ] Profil fotografa: zdjęcia ładują się, pakiety klikają się.  
- [ ] Booking: można wybrać slot, wpisać adres, widzieć cenę.  
- [ ] Maile: przychodzą (sandbox), temat i treść jak w specyfikacji.  
- [ ] Stripe: testowa karta OK, webhook ustawia `confirmed`.  
- [ ] P24: sandbox OK, webhook ustawia `confirmed`.  
- [ ] Panel fotografa: można ustawić sloty i ceny.  
- [ ] Admin: akceptuje fotografa i widzi rezerwacje.  
- [ ] Opinie: po `done` można dodać ocenę i komentarz.  
- [ ] Android build (Capacitor) instaluje się na testowym urządzeniu.  

> E2E manualne: przejdź cały proces jak klient (zrób 2–3 fikcyjne rezerwacje w sandboxie), a potem jak fotograf i admin.

---

## 9) Notatki operacyjne (ważne na produkcji)
- **Ceny i waluty**: trzymaj jako INT w groszach (np. 700 PLN = 70000).  
- **Webhooki**: muszą być publiczne i mieć weryfikację sygnatury.  
- **Logi i monitoring**: Sentry (błędy), UptimeRobot (dostępność).  
- **RODO**: usuwanie konta usuwa dane osobowe (maskuj w rezerwacjach).  
- **Weryfikacja fotografa**: manualna jest OK na start (mała skala).  
- **Backups DB**: codziennie, retencja 30 dni. Raz w miesiącu test odtworzenia.

---

## 10) Częste błędy i szybkie fixy
- **Błąd importu `@/...`** → brak aliasu w `vite.config.ts`/`tsconfig.json`. Dodaj wg §2.  
- **Płatność na FE „sukces”, a w panelu `pending`** → brak obsługi webhooka lub zły secret. Sprawdź logi i dashboard operatora.  
- **Ikona PWA nie działa** → brak `manifest.json` lub złe ścieżki do ikon.  
- **Apple Pay nie pokazuje się** → brak weryfikacji domeny w Stripe (plik w `/public`).

---

## 11) Minimalne treści prawne (do uzupełnienia z prawnikiem)
- **Regulamin**: rola pośrednika, brak odpowiedzialności za jakość usługi fotografa (poza marketplace), zwroty, spory.  
- **Polityka prywatności**: administrator danych, cele, podstawy prawne, odbiorcy, prawa osób.  
- **Umowa z fotografem**: prowizja, standard jakości, verifications, zawieszenia, prawa autorskie.  
- **Zgody**: checkboxy na formularzach (akcept regulaminu, polityki).

---

## 12) Co dalej po MVP (kierunki rozwoju)
- **Płatności split (automatyczne rozdzielanie)**.  
- **Push notyfikacje** (OneSignal/FCM).  
- **Czat klient–fotograf w aplikacji**.  
- **Subskrypcje premium dla fotografów** (wyróżnienia).  
- **Geolokalizacja** i dynamiczne ceny dojazdu.

---

## 13) Mini-słowniczek (żeby było „po ludzku”)
- **PWA** – strona, którą można „zainstalować jak apkę” na telefonie.  
- **Capacitor** – narzędzie, które pakuje stronę w natywną apkę Android/iOS.  
- **Webhook** – „telefon” od operatora płatności do Twojego serwera z potwierdzeniem.  
- **Sandbox** – tryb testowy płatności.  
- **Backend/Frontend** – serwer (logika, baza) / aplikacja w przeglądarce/telefonie.  

---

## 14) Checklisty do druku
**Start projektu**
- [ ] Alias @ działa
- [ ] Routing działa
- [ ] PWA dodaje się do ekranu
- [ ] Mock lista fotografów
- [ ] Mock booking z podsumowaniem

**Płatności**
- [ ] Stripe test OK (karta + webhook)
- [ ] Apple/Google Pay włączone
- [ ] Przelewy24 sandbox OK
- [ ] E-maile potwierdzeń przychodzą

**Panele**
- [ ] Fotograf: rejestracja → profil → dostępność
- [ ] Admin: akceptacja fotografa
- [ ] Opinie: działają po `done`

**Publikacja**
- [ ] Android build (Capacitor)
- [ ] Google Play – closed testing
- [ ] Landing + kampania lokalna
