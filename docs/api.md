# PixMemo — API (REST, JSON, MVP)

## Zasady
- Autoryzacja: Bearer JWT (fotograf, admin). Klient może bookować bez konta (zostawia e-mail/telefon).
- Paginacja: `?limit=50&cursor=...`
- Idempotency: nagłówek `Idempotency-Key` dla operacji tworzących.

## Auth
### POST /auth/register
Request:
```json
{ "email": "a@b.pl", "password": "...", "role": "photographer|client" }
```
Response `201`:
```json
{ "userId": "uuid" }
```

### POST /auth/login
```json
{ "email": "a@b.pl", "password": "..." }
```
Response `200`:
```json
{ "token": "JWT", "user": { "id":"uuid", "role":"photographer" } }
```

## Publiczne
### GET /photographers?city=Torun&date=2025-09-10
Zwraca listę fotografów z dostępnością dla danego dnia.
- Sort: rating, cena „od”.

### GET /photographers/:id
Profil + pakiety + rating + badge verified.

## Panel Fotografa (JWT: photographer)
### GET /me/photographer
Zwraca profil, pakiety, dostępność, rezerwacje.

### PUT /me/photographer
Aktualizacja: `full_name`, `city`, `bio`, `primary_photo_url`.

### POST /me/photographer/packages
```json
{ "name":"Złoty","price_pln":700,"description":"..." }
```

### PUT /me/photographer/availability
```json
{ "date":"2025-09-10","slots":["10:00","12:00","17:30"] }
```

### POST /me/photographer/documents
Multipart file upload, zapis w `photographer_documents`.

## Rezerwacje (klient)
### POST /bookings
```json
{
  "photographer_id":"uuid",
  "package_id":"uuid",
  "date":"2025-09-10",
  "time":"17:00",
  "address": { "street":"...", "postal":"87-100", "city":"Toruń" },
  "distance_km": 32.0,
  "travel_cost_pln": 1400,
  "discount_pct": 10
}
```
Response `201`:
```json
{ "booking_id":"uuid", "status":"awaiting_payment", "price_final_pln": 37400 }
```

## Płatności
### POST /payments/stripe/create-intent
```json
{ "booking_id":"uuid", "amount_pln":374 }
```
→ `{ "clientSecret":"..." }`

### POST /payments/p24/create-session
```json
{ "booking_id":"uuid", "amount_pln":374 }
```
→ `{ "redirectUrl":"https://..." }`

**Webhooks**  
- `POST /webhooks/stripe` → `payment_intent.succeeded` → `bookings.status=confirmed`
- `POST /webhooks/p24` → sukces → `confirmed`

## Opinie
### POST /reviews
```json
{ "booking_id":"uuid","rating":5,"comment":"Super!" }
```

## Admin (JWT: admin)
- `GET /admin/photographers?status=submitted|under_review`
- `POST /admin/photographers/:id/approve`
- `POST /admin/photographers/:id/reject`
- `GET /admin/bookings?status=...`
- `GET /admin/finance/summary?from=..&to=..`
