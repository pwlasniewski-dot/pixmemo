# PixMemo — Architektura i hosting (MVP)

## Cel
Uruchomić PixMemo jako **dodatkową aplikację** pod adresem `https://wlasniewski.pl/pixmemo` bez ingerencji w istniejącą stronę.

## Architektura (MVP)
```
[ Klient (PWA/Capacitor) ]  →  [ Router z basename: /pixmemo ]
                |
                v
[ API (Node.js + Express + TS) ]  →  [ Postgres (Neon/Supabase) ]
                |          \
                |           \—— [ Stripe + Przelewy24 ] (płatności)
                |
                v
[ Mail (Resend/SMTP) ]   [ Storage S3-kompat. (Supabase Storage) ]
```
- **Frontend**: React + Vite + Tailwind, **React Router z `basename='/pixmemo'`**.
- **Backend**: Node/Express (TS), ORM Prisma, REST JSON.
- **Baza**: Postgres. Migracje przez Prisma Migrate.
- **Płatności**: Stripe (karty/Apple Pay/Google Pay), Przelewy24 (BLIK/przelewy).
- **PWA**: manifest + service worker (działa również w sub-ścieżce).

## Hosting w sub-ścieżce `/pixmemo`
### Vite (prod build) pod podkatalogiem
W `vite.config.ts` ustaw:
```ts
export default defineConfig({
  base: "/pixmemo/",
  // ...reszta
});
```
W **React Router** użyj:
```tsx
<BrowserRouter basename="/pixmemo">
  {/* routes */}
</BrowserRouter>
```

### Apache (.htaccess) — single page app
W katalogu deploymentu (`/pixmemo/` na serwerze) dodaj `.htaccess`:
```
RewriteEngine On
RewriteBase /pixmemo/
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /pixmemo/index.html [L]
```
> Dzięki temu odświeżanie `/pixmemo/booking` nie zwróci 404.

### Nginx (alternatywnie)
```
location /pixmemo/ {
  try_files $uri /pixmemo/index.html;
}
```

## Środowiska
- `dev`: lokalnie `http://localhost:5173/pixmemo/`
- `staging`: subdomena (np. `staging.wlasniewski.pl/pixmemo/`)
- `prod`: `wlasniewski.pl/pixmemo/`

## Domeny płatności
- **Stripe Apple Pay**: wymagana weryfikacja domeny → umieść plik z Stripe w `/pixmemo/.well-known/apple-developer-merchantid-domain-association` lub na głównej domenie (zgodnie z instrukcją Stripe). Dopuszczalna jest weryfikacja na domenie głównej bez wpływu na resztę.

## Monitoring
- Sentry (FE/BE), UptimeRobot ping na `/api/healthz`.
