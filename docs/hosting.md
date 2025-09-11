# PixMemo — Hosting pod `wlasniewski.pl/pixmemo`

## Vite
- `vite.config.ts`: `base: "/pixmemo/"`

## React Router
```tsx
<BrowserRouter basename="/pixmemo">
  {/* routes */}
</BrowserRouter>
```

## Apache (.htaccess)
```
RewriteEngine On
RewriteBase /pixmemo/
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /pixmemo/index.html [L]
```

## Test lokalny
- `npm run build` → wypchnij zawartość `dist/` do `/pixmemo/` na serwerze.
- Sprawdź bezpośrednio: `wlasniewski.pl/pixmemo/photographers`
