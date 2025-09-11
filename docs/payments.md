# PixMemo — Integracja płatności (Stripe + Przelewy24)

## Stripe (karty, Apple Pay, Google Pay)
### Kroki
1. Konto Stripe → włącz Apple/Google Pay (Dashboard).  
2. FE: Stripe Elements / Payment Request Button (dla Apple/Google Pay).  
3. BE: `POST /payments/stripe/create-intent` → PaymentIntent kwota w groszach.  
4. Webhook: `payment_intent.succeeded` → `bookings.status=confirmed`.

### Apple Pay (wymagana weryfikacja domeny)
- Pobierz plik weryfikacyjny ze Stripe i umieść w:
  - `/pixmemo/.well-known/apple-developer-merchantid-domain-association`  
  **lub** na domenie głównej jeśli Stripe tego wymaga (zgodnie z dokumentacją).

### Google Pay
- Automatycznie działa przez Stripe Payment Request Button w Chrome/Android.

## Przelewy24 (BLIK, przelewy)
### Kroki
1. Konto P24 → sandbox.  
2. BE: `create-session` → redirect klienta do P24.  
3. Webhook potwierdzenia (CRC) → `bookings.status=confirmed`.

## Bezpieczeństwo
- Nie dotykamy danych kart (tokenizacja przez Stripe/P24).  
- Weryfikacja sygnatur webhooków.  
- Idempotency-Key dla tworzenia intentów/sesji.

## Rozliczenia z fotografami (MVP)
- Środki wpływają na Twoje konto.  
- Wypłaty do fotografów: **manualnie** (np. co tydzień) na podstawie `confirmed`/`done`.  
- V1.2: Stripe Connect / P24 Partners (automatyczny split).
