# PixMemo – Front-end (React + Vite + Tailwind)

Minimalny szablon produkcyjny z Routerem i basename `/pixmemo`.

## Skrypty
- `npm run dev` – tryb deweloperski
- `npm run build` – build do `dist/`
- `npm run preview` – podgląd buildu

## Deploy
1. `npm install`
2. Uzupełnij `.env.local` (np. `VITE_API_URL`).
3. `npm run build`
4. Skopiuj zawartość `dist/` na serwer do `/pixmemo/` i dodaj `.htaccess`.

## .htaccess (Apache SPA)
Patrz plik `.htaccess` w repozytorium – musi być obok zdeployowanego `index.html`.
