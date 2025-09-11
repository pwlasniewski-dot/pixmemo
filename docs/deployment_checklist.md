# PixMemo — Deployment checklist (`/pixmemo` na wlasniewski.pl)

## Frontend
- [ ] `vite.config.ts` → `base: "/pixmemo/"`
- [ ] `<BrowserRouter basename="/pixmemo">` w AppRoutes
- [ ] Build: `npm run build` → zawartość `dist/` wgrywasz do `/pixmemo/` na serwerze

## Serwer www (Apache)
- [ ] W katalogu `/pixmemo/` dodaj `.htaccess` (SPA rewrite):
```
RewriteEngine On
RewriteBase /pixmemo/
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /pixmemo/index.html [L]
```

## Stripe (Apple/Google Pay)
- [ ] Włącz Apple/Google Pay w Stripe
- [ ] Plik weryfikacyjny Apple Pay w `/pixmemo/.well-known/apple-developer-merchantid-domain-association`

## Przelewy24
- [ ] Sandbox: klucze i webhook URL → `/api/webhooks/p24` (publiczny)

## PWA
- [ ] `manifest.json` i ikony w `public/`
- [ ] Test na Android: „Dodaj do ekranu głównego”

## Monitoring
- [ ] Sentry (FE/BE) klucze ustawione
- [ ] UptimeRobot: monitor `/api/healthz`
