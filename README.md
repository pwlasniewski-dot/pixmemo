# PixMemo MVP

Repozytorium zawiera uproszczoną implementację MVP aplikacji PixMemo opisaną w dokumentacji produktowej.

## Struktura
- `backend/` — serwer HTTP w czystym Node.js udostępniający mockowe API.
- `frontend/` — statyczny interfejs PWA komunikujący się z API.
- `docs/` — materiały analityczne dostarczone wcześniej.

## Szybki start
1. **API**
   ```bash
   cd backend
   npm start
   ```
   Serwer uruchomi się na porcie `4000` i będzie obsługiwał endpointy `/api`.

2. **Frontend**
   Serwuj katalog `frontend/` jako statyczne pliki (np. `npx http-server frontend -p 5173`).
   Następnie odwiedź `http://localhost:5173/index.html`.
   Aplikacja automatycznie wykryje swój katalog (`/` lub `/pixmemo/`) i
   oczekuje, że API będzie działać pod `http://localhost:4000/api`.

## Ograniczenia
- Implementacja korzysta z danych mockowych (brak bazy danych i płatności).
- Walidacje i logika płatności są uproszczone do potrzeb dema.
- Ze względu na brak dostępu do menedżera pakietów w środowisku zadania użyto rozwiązań bez zależności zewnętrznych.
