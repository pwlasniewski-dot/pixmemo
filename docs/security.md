# PixMemo — Bezpieczeństwo (MVP)

- JWT (httpOnly refresh, access token w pamięci; rotacja).  
- Szyfrowanie haseł: argon2id.  
- Walidacja danych (Zod/Yup) – wszystkie wejścia.  
- Rate limiting (IP): 100/5min public, 30/5min mutacje.  
- Webhooki: weryfikacja sygnatur (Stripe/P24).  
- CORS: tylko produkcyjna domena.  
- Backups DB: 24h, retencja 30 dni; test odtworzenia 1×/mies.  
- Audyt logów: tworzenie/edycja bookingów, płatności, weryfikacje.
