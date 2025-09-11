# PixMemo — Mockupy UX (MVP)

> To są szkice funkcjonalne (wireframes) do szybkiego wdrożenia. Nie są „pixel-perfect”, ale zawierają wszystkie elementy potrzebne devowi.

## 1. /pixmemo (Landing)
```
┌──────────────────────────────────────────────┐
│  PixMemo 📸                                  │
│  Fotograf na dziś / jutro                    │
│  [ Wybierz miasto ▾ ] [ DZIŚ ▾ ] [ SZUKAJ ]  │
│                                              │
│  [ Zaloguj (fotograf/admin) ]                │
└──────────────────────────────────────────────┘
```

## 2. /pixmemo/photographers
```
[ Filtry: miasto ▾ | data ▾ | sort: ocena/cena ]
┌──────────────────────────────────────────────┐
│  Jan Kowalski [Verified] ⭐ 4.9 (12)          │
│  Toruń · od 400 PLN                           │
│  [ Zobacz profil ]  [ Rezerwuj ]              │
├──────────────────────────────────────────────┤
│  Anna Nowak  ⭐ 5.0 (8)                        │
│  Wąbrzeźno · od 500 PLN                        │
│  [ Zobacz profil ]  [ Rezerwuj ]              │
└──────────────────────────────────────────────┘
```

## 3. /pixmemo/photographer/:id
```
Jan Kowalski [Verified]  ⭐ 4.9 (12)
Toruń
[Portfolio miniatury x6]
Pakiety:
- Ekonomiczny — 400 PLN
- Złoty — 700 PLN
- Platynowy — 1200 PLN
[ Rezerwuj termin ]
```

## 4. /pixmemo/booking
```
Fotograf: Jan Kowalski
Pakiet: [ Ekonomiczny ▾ ]
Data:  [ 2025-09-15 ]
Godzina (sloty): [10:00][12:00][17:30]
Adres: [Ulica] [Kod] [Miasto]
Dystans: 32 km  → dojazd 14 PLN
Bonus:  -10% (z koła fortuny)
────────────────────────────
Suma: 374 PLN
[ Zapłać online ]
```

## 5. /pixmemo/auth/login
```
E-mail
Hasło
[ Zaloguj ]   [ Zapomniałem hasła ]
```

## 6. /pixmemo/auth/register-photographer
```
Imię i nazwisko, Miasto, Bio
Portfolio (min. 5 zdjęć)
[ Wyślij do weryfikacji ]
( Status: Oczekuje na akcept admina )
```

## 7. /pixmemo/dashboard/photographer
```
Profil (edycja) | Pakiety (CRUD) | Dostępność (sloty)
Rezerwacje:
- 12.09 17:00  Anna K.  Złoty  Toruń  [Potwierdzona]
- 14.09 12:00  Piotr M. Ekonom. Chełmża [Oczekuje]
```

## 8. /pixmemo/dashboard/admin
```
Fotografowie do weryfikacji:
- Jan K.  portfolio:8  [Akceptuj][Odrzuć]

Rezerwacje (filtr status):
- 10.09 14:00  Anna K. → Jan K.  700 PLN  [Potwierdzona]

Raporty/prowizje: okres ▾  suma prowizji = 1200 PLN
```

## 9. Koło Fortuny (opcjonalnie)
- Widżet na stronie lokalnej (np. /pixmemo/lisewo): 6–12 segmentów, 3 zniżkowe.
- Po losowaniu: wpis do `localStorage` i przekierowanie do /booking z `discount_pct`.
