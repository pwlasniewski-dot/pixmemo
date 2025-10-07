# PixMemo Frontend (statyczne MVP)

Ten katalog zawiera prostą implementację interfejsu PixMemo w czystym HTML/CSS/JS. Pliki mogą być serwowane spod dowolnej ścieżki (np. `/pixmemo/`), ponieważ aplikacja w locie wykrywa swój katalog poprzez `window.__PIXMEMO_PUBLIC_PATH__`.

## Funkcje
- Lista fotografów z filtrowaniem po mieście.
- Szczegóły profilu wraz z pakietami, opiniami i polityką podróży.
- Podgląd dostępnych terminów oraz szybkie wypełnianie formularza.
- Formularz rezerwacji wysyłający dane do endpointu `/api/bookings`.
- PWA: manifest + prosty service worker z cachingiem zasobów statycznych.

## Konfiguracja
Jeżeli API dostępne jest pod inną ścieżką, można zdefiniować globalną zmienną `window.__PIXMEMO_API_PREFIX__` przed załadowaniem `app.js`.
