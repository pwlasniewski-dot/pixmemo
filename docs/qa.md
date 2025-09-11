# PixMemo — QA / Testy (MVP)

## E2E scenariusze krytyczne
1) **Rezerwacja + Stripe**
- Klient: lista → profil → booking → płatność testową kartą 4242…
- Oczekiwane: webhook `succeeded`, booking=confirmed, mail do klienta/fotografa/admina.

2) **Rezerwacja + P24 (BLIK)**
- Oczekiwane: `confirmed` po webhooku.

3) **Weryfikacja fotografa**
- Rejestracja → upload portfolio → admin approve → widoczny publicznie z badge (jeśli verified).

4) **Opinie**
- Po `done` klient wystawia ocenę; profil aktualizuje `rating_avg`/`count`.

## Lista kontrolna urządzeń/przeglądarek
- Android Chrome (PWA + Google Pay)
- iOS Safari (PWA + Apple Pay — po weryfikacji domeny)
- Desktop Chrome/Firefox/Safari/Edge

## Performance
- GET /photographers – P95 < 300ms (przy 200 RPS) – test k6.

## Regressions
- Odświeżenie na `/pixmemo/...` nie powoduje 404 (rewrites ustawione).
