# PixMemo API (Node.js bez zależności zewnętrznych)

Prosty serwer HTTP w czystym Node.js udostępniający minimalny zestaw endpointów opisanych w dokumentacji PixMemo. Implementacja korzysta z danych mockowych i zapisuje rezerwacje w pliku `src/storage/bookings.json`.

## Endpointy
- `GET /api/healthz` — status API.
- `GET /api/photographers` — lista fotografów (opcjonalny parametr `city`).
- `GET /api/photographers/:id` — szczegóły fotografa.
- `GET /api/photographers/:id/availability` — dostępne terminy.
- `POST /api/bookings` — utworzenie rezerwacji (walidacja terminu i wymaganych pól).
- `GET /api/bookings/:id` — podgląd utworzonej rezerwacji.

## Uruchomienie
```bash
npm start
```
Serwer nasłuchuje na porcie `4000` (konfigurowalny przez zmienną `PORT`).

## Dane i walidacja
- Fotografowie są wczytywani z `src/data.js`.
- Rezerwacje zapisywane są w pliku JSON (persistencja między restartami).
- Walidacja sprawdza wymagane pola oraz dostępność slotu czasowego.
